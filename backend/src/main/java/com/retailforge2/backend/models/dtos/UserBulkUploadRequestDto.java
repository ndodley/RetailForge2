package com.retailforge2.backend.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record UserBulkUploadRequestDto(
        @NotEmpty(message = "At least one row is required")
        List<@Valid UserBulkUploadRowDto> rows
) {
}

