package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;

    @PostMapping("/create")
    public OrderDto createOrder(@RequestParam Integer userId, @RequestParam String address) {
        return orderService.createOrder(userId, address);
    }

    @GetMapping("/{orderId}")
    public OrderDto getOrder(@PathVariable Integer orderId) {
        return orderService.getOrder(orderId);
    }
}
