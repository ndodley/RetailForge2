package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@SuppressWarnings("unused")
public record ProductBulkUploadRequestDto(
        @NotEmpty(message = "At least one row is required")
        List<@Valid ProductBulkUploadRowDto> rows
) {
}

