package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;

public record CartItemDto(
        Integer id,
        Integer productId,
        String name,
        String categoryName,
        String imagePath,
        BigDecimal price,
        Integer quantity,
        Integer stock
) {}
