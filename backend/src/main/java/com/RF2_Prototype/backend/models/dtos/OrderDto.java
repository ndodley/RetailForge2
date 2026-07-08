package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public record OrderDto(
        Integer id,
        Integer userId,
        String userEmail,
        String address,
        BigDecimal total,
        String status,
        Timestamp createdAt,
        List<OrderItemDto> items
) {}