package com.retailforge2.backend.models.dtos;

public record CompleteCheckoutRequest(
        Integer userId,
        String address
) {}
