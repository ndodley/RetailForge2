package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.models.dtos.OrderItemDto;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailsController {

    private final OrderItemRepository orderItemRepository;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemDto>> getOrderItems(@PathVariable Integer orderId) {

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        List<OrderItemDto> dto = items.stream()
                .map(oi -> new OrderItemDto(
                        oi.getId(),
                        oi.getProductId(),
                        oi.getProductName(),
                        oi.getImagePath(),
                        oi.getPrice(),
                        oi.getQuantity()
                ))
                .toList();

        return ResponseEntity.ok(dto);
    }
}
