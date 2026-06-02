package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;

@SuppressWarnings("unused")
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

