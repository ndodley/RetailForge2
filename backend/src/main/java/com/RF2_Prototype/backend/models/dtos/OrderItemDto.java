package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;

public record OrderItemDto(
        Integer id,
        Integer productId,
        String productName,
        String imagePath,
        BigDecimal price,
        Integer quantity
) {}
