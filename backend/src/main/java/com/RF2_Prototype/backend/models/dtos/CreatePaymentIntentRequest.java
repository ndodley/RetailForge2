package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;

public record CreatePaymentIntentRequest(
        BigDecimal amount
) {}
