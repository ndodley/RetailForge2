package com.retailforge2.backend.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ReviewBulkUploadRowDto(
        @NotBlank(message = "Product name is required")
        String productName,

        @NotBlank(message = "User email is required")
        String userEmail,

        @NotNull(message = "Rating is required")
        BigDecimal rating,

        String comment
) {
}
