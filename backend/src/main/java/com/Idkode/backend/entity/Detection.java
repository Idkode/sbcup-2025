package com.Idkode.backend.entity;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Detection {
    @NotNull
    private Double confidence;
    @NotNull
    private String label;
    @NotNull
    private Double x1;
    @NotNull
    private Double y1;
    @NotNull
    private Double x2;
    @NotNull
    private Double y2;
}
