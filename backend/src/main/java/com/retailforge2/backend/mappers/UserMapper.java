package com.retailforge2.backend.mappers;

import com.retailforge2.backend.models.dtos.AuthUserDto;
import com.retailforge2.backend.models.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthUserDto toDto(User user) {
        return new AuthUserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getAvatar_path(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
