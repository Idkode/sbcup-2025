package com.Idkode.backend.controller;

import com.Idkode.backend.dtos.ImageDTO;
import com.Idkode.backend.dtos.ImageFullDTO;
import com.Idkode.backend.entity.Image;
import com.Idkode.backend.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RequestMapping("/image")
@RestController
public class ImageController {

    private final ImageService imageService;

    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping("/cameras")
    public ResponseEntity<List<String>> getCameras(@RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date){
        List<String> cameras = imageService.getCameras(date);
        return ResponseEntity.ok().body(cameras);
    }

    @PostMapping("/upload")
    public ResponseEntity<Image> upload(@RequestParam("image") MultipartFile image,
                                        @RequestParam("camera") String camera,
                                        @RequestParam("name") String name,
                                        @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
                                        @RequestParam("time") @DateTimeFormat(pattern = "HH-mm-ss") LocalTime time) throws IOException {

    Image entity = imageService.saveImage(image, camera, name, date, time);
    imageService.processImage(entity.getPath(), entity.getId());
    URI uri = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(entity.getId())
            .toUri();
    return ResponseEntity.created(uri).body(entity);
    }

    @GetMapping("/general")
    public ResponseEntity<List<ImageDTO>> get(@RequestParam(value = "camera") String camera,
                                     @RequestParam(value = "date", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) throws IOException {

        List<ImageDTO> dtos = imageService.findImages(camera, date);
        return ResponseEntity.ok().body(dtos);
    }

    @GetMapping("/specific")
    public ResponseEntity<ImageFullDTO> getInfo(@RequestParam("camera") String camera,
                                                @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
                                                @RequestParam("time") @DateTimeFormat(pattern = "HH-mm-ss") LocalTime time,
                                                @RequestParam(value = "annotated", defaultValue = "true") Boolean annotated) throws IOException {
        ImageFullDTO dto = imageService.retrieveImage(camera, date, time, annotated);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/specific/less")
    public ResponseEntity<ImageDTO> getLessInfo(@RequestParam("camera") String camera,
                                                @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
                                                @RequestParam("time") @DateTimeFormat(pattern = "HH-mm-ss") LocalTime time) throws IOException {
        ImageDTO dto = imageService.findImage(camera, date, time);
        return ResponseEntity.ok().body(dto);
    }

}

