package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentBulkUploadRowDto(
        @NotBlank(message = "Department name is required")
        @Size(max = 255, message = "Department name must be 255 characters or fewer")
        String name
) {
}


