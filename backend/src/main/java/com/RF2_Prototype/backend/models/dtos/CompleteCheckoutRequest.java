package com.RF2_Prototype.backend.models.dtos;

public record CompleteCheckoutRequest(
        Integer userId,
        String address
) {}
