package com.retailforge2.backend.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DepartmentBulkUploadRequestDto(
        @NotEmpty(message = "At least one row is required")
        List<@Valid DepartmentBulkUploadRowDto> rows
) {
}


