package com.retailforge2.backend.models.dtos;

import java.time.LocalDateTime;

// One entry in the "recent chats" list.
public record ChatSessionDto(
        Integer id,
        String conversationId,
        String title,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
