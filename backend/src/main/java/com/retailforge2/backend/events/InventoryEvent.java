package com.retailforge2.backend.events;

import java.time.Instant;

// Published to the rf2.inventory topic whenever a product's stock changes
// (see ProductService / OrderService). lowStock reflects whether newStock
// has crossed kafka.low-stock-threshold at the time this event was raised.
public record InventoryEvent(
        Integer productId,
        String productName,
        Integer newStock,
        boolean lowStock,
        Instant occurredAt
) {}
