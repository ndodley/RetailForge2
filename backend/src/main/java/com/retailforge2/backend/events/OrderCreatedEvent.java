package com.retailforge2.backend.events;

import java.math.BigDecimal;
import java.time.Instant;

// Published to the rf2.orders topic whenever a checkout completes
// (see PaymentService.completeCheckout() / OrderService.createOrder()).
public record OrderCreatedEvent(
        Integer orderId,
        Integer userId,
        BigDecimal total,
        String status,
        Instant occurredAt
) {}
