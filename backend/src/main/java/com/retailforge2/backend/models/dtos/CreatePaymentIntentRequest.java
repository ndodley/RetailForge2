package com.retailforge2.backend.models.dtos;

import java.math.BigDecimal;

public record CreatePaymentIntentRequest(
        BigDecimal amount
) {}
