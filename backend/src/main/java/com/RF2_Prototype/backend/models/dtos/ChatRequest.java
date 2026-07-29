package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank String message
) {
}
