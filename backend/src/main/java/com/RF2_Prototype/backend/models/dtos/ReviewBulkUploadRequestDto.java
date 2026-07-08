package com.RF2_Prototype.backend.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReviewBulkUploadRequestDto(
        @NotEmpty(message = "At least one row is required")
        List<@Valid ReviewBulkUploadRowDto> rows
) {
}
