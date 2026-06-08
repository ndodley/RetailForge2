package com.RF2_Prototype.backend.models.dtos;

public record AuthUserDto (
        Integer id,
        String firstName,
        String lastName,
        String email,
        String role,
        String phoneNumber,
        String address
){
}
