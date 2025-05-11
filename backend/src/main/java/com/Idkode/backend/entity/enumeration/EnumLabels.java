package com.Idkode.backend.entity.enumeration;

import lombok.Getter;

import java.awt.*;
import java.util.Objects;

/**
 * Detection classes for the images
 */
@Getter
public enum EnumLabels {
    Carro("Car", 0, new Color(0, 0, 255)),
    Moto("Motorcycle", 1, new Color(0, 255, 0)),
    Bus("Bus", 2, new Color(255, 255, 0)),
    Vehicle("Vehicle", 3, new Color(255, 0, 0));

    private final String label;
    private final int id;
    private final Color color;

    EnumLabels(String label, int id, Color color) {
        this.label = label;
        this.id = id;
        this.color = color;
    }

    public static String getLabelForValue(Integer value) {
        for (EnumLabels label : EnumLabels.values()) {
            if (label.getId() == value) {
                return label.getLabel();
            }
        }
        return null;
    }

    public static Color getColorForLabel(String value) {
        for (EnumLabels label : EnumLabels.values()) {
            if (Objects.equals(label.getLabel(), value)) {
                return label.getColor();
            }
        }
        return null;
    }
}
