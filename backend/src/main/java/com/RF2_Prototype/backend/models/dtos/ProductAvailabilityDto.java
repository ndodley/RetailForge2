package com.RF2_Prototype.backend.models.dtos;

import java.math.BigDecimal;

// Deliberately narrower than ProductDto: only what the chat assistant needs to
// answer stock/price/availability questions, so tool results stay small and
// don't leak internal fields (ids, image paths) to the model/user.
public record ProductAvailabilityDto(
        String name,
        String brand,
        BigDecimal price,
        Integer stock,
        String departmentName
) {
}
