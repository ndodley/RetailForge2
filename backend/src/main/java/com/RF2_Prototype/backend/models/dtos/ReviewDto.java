package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReviewDto(
        Integer id,
        @NotNull(message = "Product is required")
        Integer productId,
        String productName,
        String productImagePath,
        @NotNull(message = "User is required")
        Integer userId,
        String userEmail,
        String userFullName,
        String userAvatarPath,
        @NotNull(message = "Rating is required")
        BigDecimal rating,
        String comment,
        LocalDateTime created_at,
        LocalDateTime updated_at
) {}
