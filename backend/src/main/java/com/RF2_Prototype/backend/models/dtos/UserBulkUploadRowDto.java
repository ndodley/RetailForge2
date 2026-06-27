package com.RF2_Prototype.backend.models.dtos;

import com.RF2_Prototype.backend.models.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserBulkUploadRowDto(

        @NotBlank(message = "User first name is required")
        @Size(max = 100, message = "User first name must be 100 characters or fewer")
        String firstName,

        @NotBlank(message = "User last name is required")
        @Size(max = 100, message = "User last name must be 100 characters or fewer")
        String lastName,

        @NotBlank(message = "User email is required")
        @Size(max = 255, message = "User email must be 255 characters or fewer")
        String email,

        @NotBlank(message = "User role is required")
        @Size(max = 255, message = "User role must be either CUSTOMER, MANAGER, EMPLOYEE")
        UserRole userRole,

        @NotBlank(message = "User phone number is required")
        @Size(max = 11, message = "User phone number must be 11 characters or fewer")
        String phoneNumber,

        @NotBlank(message = "User address is required")
        @Size(max = 255, message = "User address must be 255 characters or fewer")
        String address

) {
}
