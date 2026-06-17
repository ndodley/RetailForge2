package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(
        Integer id,
        Integer userId,
        List<CartItemDto> items,
        BigDecimal subtotal,
        Integer totalItems
) {}
