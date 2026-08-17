package com.retailforge2.backend.models.dtos;

import com.retailforge2.backend.models.enums.UserRole;

import java.time.LocalDateTime;

public record AuthUserDto (
        Integer id,
        String firstName,
        String lastName,
        String email,
        String passwordHash,
        UserRole role,
        String phoneNumber,
        String address,
        String avatar_path,
        LocalDateTime created_at,
        LocalDateTime updated_at
){
}
