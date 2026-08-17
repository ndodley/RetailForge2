package com.retailforge2.backend.models.dtos;

public record AuthResponse (
        String message,
        AuthUserDto user
) {
}
