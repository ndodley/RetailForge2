package com.retailforge2.backend.models.dtos;

import java.math.BigDecimal;

public record ProductDto(
        Integer id,
        String name,
        String brand,
        BigDecimal rating,
        BigDecimal price,
        String description,
        Integer stock,
        String imagePath,
        Integer categoryId,
        String categoryName,
        Integer departmentId,
        String departmentName
) {
}

