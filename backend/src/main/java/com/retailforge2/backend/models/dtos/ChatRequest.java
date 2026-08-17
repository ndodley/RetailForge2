package com.retailforge2.backend.models.dtos;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank String message,
        // Which chat session (thread) this message belongs to. The frontend
        // gets this by calling POST /api/chat/sessions first (on "new chat"
        // or first open) - the backend verifies it actually belongs to the
        // caller before using it, never trusting it blindly.
        @NotBlank String conversationId
) {
}
