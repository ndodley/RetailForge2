package com.RF2_Prototype.backend.models.dtos;

public record AuthResponse (
        String message,
        AuthUserDto user
) {
}
