package com.RF2_Prototype.backend.models.dtos;

import java.util.List;

public record CartDto(
        Integer id,
        List<CartItemDto> items,
        Double subtotal,
        Integer totalItems
) {}
