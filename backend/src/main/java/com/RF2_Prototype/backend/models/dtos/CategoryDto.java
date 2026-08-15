package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryDto(
        Integer id,
        @NotBlank(message = "Category name is required")
        @Size(max = 255, message = "Category name must be 255 characters or fewer")
        String name,
        @NotBlank(message = "Category description is required")
        String description,
        @NotNull(message = "Department is required")
        Integer departmentId,
        String departmentName,
        Integer productCount
) {
}
