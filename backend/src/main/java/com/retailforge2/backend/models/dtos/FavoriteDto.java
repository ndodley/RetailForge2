package com.retailforge2.backend.models.dtos;

import java.time.LocalDateTime;

public record FavoriteDto(
        Integer id,
        Integer userId,
        Integer productId,
        LocalDateTime createdAt
) {
}
