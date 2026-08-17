package com.retailforge2.backend.models.dtos;

import java.math.BigDecimal;

public record CartItemDto(
        Integer id,
        Integer productId,
        String productName,
        String brand,
        String categoryName,
        String imagePath,
        BigDecimal priceAtTime,
        Integer quantity,
        Integer stock
) {}
