package com.Idkode.backend.dtos;

import com.Idkode.backend.entity.Detection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageFullDTO {

    private String camera;

    private LocalDateTime datetime;

    private String image;

    private List<Detection> detections;
}
