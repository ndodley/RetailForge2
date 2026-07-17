package com.RF2_Prototype.backend.models.dtos;

import java.time.LocalDateTime;

public record FavoriteDto(
        Integer id,
        Integer userId,
        Integer productId,
        LocalDateTime createdAt
) {
}
