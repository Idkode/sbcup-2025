package com.Idkode.backend.service;

import com.Idkode.backend.dtos.ImageDTO;
import com.Idkode.backend.dtos.ImageFullDTO;
import com.Idkode.backend.entity.Detection;
import com.Idkode.backend.entity.enumeration.EnumLabels;
import com.Idkode.backend.entity.Image;
import com.Idkode.backend.repository.ImageRepository;
import com.Idkode.backend.service.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ImageService {

    private final Logger logger = LoggerFactory.getLogger(ImageService.class);

    private final ImageRepository imageRepository;
    private final MongoTemplate mongoTemplate;

    @Value("${images.directory}")
    private String uploadDirectory;

    @Value("${MODEL_URL}")
    private String modelUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public ImageService(ImageRepository imageRepository, MongoTemplate mongoTemplate, RestTemplate restTemplate) {
        this.imageRepository = imageRepository;
        this.mongoTemplate = mongoTemplate;
        this.restTemplate = restTemplate;
    }

    /**
     * Get list of cameras with data on the selected date
     *
     * @param date the date
     * @return the list of cameras
     */
    public List<String> getCameras(LocalDate date){
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        Date from = Date.from(start.atZone(ZoneId.systemDefault()).toInstant());
        Date to = Date.from(end.atZone(ZoneId.systemDefault()).toInstant());

        return mongoTemplate.findDistinct(
                Query.query(
                        Criteria.where("datetime").gte(from).lte(to)
                ),
                "camera",
                Image.class,
                String.class
        );
    }


    /**
     * Saves an image in the database
     *
     * @param image  the image
     * @param camera the camera
     * @param name   the name
     * @param date   the date
     * @param time   the time
     * @return the image
     * @throws IOException the io exception
     */
    @Transactional
    public Image saveImage(MultipartFile image, String camera,
                           String name, LocalDate date,
                           LocalTime time) throws IOException {
        Image entity = new Image();
        entity.setCamera(camera);
        entity.setDatetime(LocalDateTime.of(date, time));
        Path file = Paths.get(name);
        String filename = file.getFileName().toString();
        entity.setName(filename);

        Path destinationFile = Paths.get(uploadDirectory, filename).normalize().toAbsolutePath();
        Files.copy(image.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        entity.setPath(destinationFile.toString());

        return imageRepository.save(entity);
    }

    /**
     * Get all data points (number of vehicles and time) about a specific camera in a certain date
     *
     * @param camera the camera
     * @param date   the date
     * @return the list image dtos (data points)
     */
    public List<ImageDTO> findImages(String camera,
                                     LocalDate date){
        List<Image> images = imageRepository.filterByCameraAndDate(camera,
                date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        return images.stream().map(image -> {
            ImageDTO dto = new ImageDTO();
            dto.setNumber(image.getDetections().size());
            Integer time = image.getDatetime().getHour() * 60 + image.getDatetime().getMinute();
            dto.setTime(time);
            return dto;
        }).toList();
    }

    /**
     * Get basic information about a specific camera in a certain datetime
     *
     * @param camera the camera
     * @param date   the date
     * @param time   the time
     * @return the image dto
     */
    public ImageDTO findImage(String camera,
                                    LocalDate date,
                                    LocalTime time){
        List<Image> images = imageRepository.findByCameraAndDatetime(camera, LocalDateTime.of(date, time));
        if (images.isEmpty())
            throw new ResourceNotFoundException("Image does not exist or is unavailable.");

        return images.stream().map(image -> {
            ImageDTO dto = new ImageDTO();
            dto.setNumber(image.getDetections().size());
            Integer minutes = image.getDatetime().getHour() * 60 + image.getDatetime().getMinute();
            dto.setTime(minutes);
            return dto;
        }).toList().get(0);
    }

    public ImageFullDTO retrieveImage(String camera,
                                      LocalDate date,
                                      LocalTime time,
                                      Boolean annotated) throws IOException {
        List<Image> images = imageRepository.findByCameraAndDatetime(camera, LocalDateTime.of(date, time));

        if (images.isEmpty())
            throw new ResourceNotFoundException("No images for the parameters sent");

        Image image = images.get(0);

        byte[] imageData = Files.readAllBytes(Paths.get(image.getPath()));
        String base64Image = Base64.getEncoder().encodeToString(imageData);
        ImageFullDTO dto = new ImageFullDTO();
        dto.setCamera(image.getCamera());
        dto.setDatetime(image.getDatetime());
        dto.setDetections(image.getDetections());
        if (annotated){
            dto.setImage(annotateImage(imageData, dto.getDetections()));
        } else
            dto.setImage(base64Image);

        return dto;
    }

    /**
     * Sends an image to the detection model and saves the image results
     *
     * @param filepath the image filepath
     * @param imageId  the image id
     * @return nothing
     */
    @Async
    public CompletableFuture<Void> processImage(String filepath, String imageId){
        Path path = Paths.get(filepath);
        if (!Files.exists(path)) {
            logger.error("Image not found at path: {}", filepath);
            return CompletableFuture.completedFuture(null);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(path));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            Map<String, List<Map<String, Object>>> respose = restTemplate.postForObject(
                    modelUrl,
                    requestEntity,
                    Map.class
            );

            if (respose != null && respose.containsKey("detections")) {
                List<Map<String,Object>> detections = respose.get("detections");
                List<Detection> detection = detections.stream()
                        .map(map -> new Detection(
                                (Double) map.get("confidence"),
                                EnumLabels.getLabelForValue((Integer) map.get("label")),
                                (Double) map.get("x1"),
                                (Double) map.get("y1"),
                                (Double) map.get("x2"),
                                (Double) map.get("y2")
                        ))
                        .collect(Collectors.toList());
                logger.info("{}", detection);
                imageRepository.findById(imageId).ifPresent(image -> {
                    image.setDetections(detection);
                    imageRepository.save(image);
                    logger.info("Detections saved for image: {}", path.getFileName());
                });
            } else {
                logger.error("Received null detections for image: {}", path.getFileName());
            }
            return CompletableFuture.completedFuture(null);

        } catch (Exception e) {
            logger.error("Error processing image: {}, Error: {}", imageId, e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }


    /**
     * Generates an image based on an image and a list of detections
     *
     * @param image      the image
     * @param detections the list of detections
     * @return the annotated image in base64
     */
    public static String annotateImage(byte[] image, List<Detection> detections){
        try {
            // Decode image from byte[]
            BufferedImage imageFile = ImageIO.read(new ByteArrayInputStream(image));
            if (imageFile == null) throw new IllegalArgumentException("Invalid image data");

            // Create a copy for annotation
            BufferedImage annotated = new BufferedImage(imageFile.getWidth(), imageFile.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = annotated.createGraphics();
            g2d.drawImage(imageFile, 0, 0, null);

            for (Detection det : detections) {
                Color color = EnumLabels.getColorForLabel(det.getLabel());
                g2d.setColor(color);
                g2d.setStroke(new BasicStroke(2));
                int x1 = (int) Math.round(det.getX1());
                int x2 = (int) Math.round(det.getX2());
                int y1 = (int) Math.round(det.getY1());
                int y2 = (int) Math.round(det.getY2());
                g2d.drawRect(x1, y1, x2 - x1, y2 - y1);

//                String labelText = String.format("%s (%.2f)", det.label, det.confidence);
//                g2d.drawString(labelText, det.x1 + 3, det.y1 - 5);
            }

            // Convert annotated image to Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(annotated, "jpg", baos);

            g2d.dispose();
            return Base64.getEncoder().encodeToString(baos.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
