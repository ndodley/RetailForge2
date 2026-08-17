package com.retailforge2.backend.models.dtos;

import java.math.BigDecimal;

public record ProductBulkUploadRowDto(
        String name,
        String brand,
        BigDecimal rating,
        String description,
        BigDecimal price,
        Integer stock,
        String categoryName,
        String departmentName,
        String imagePath
) {
}

