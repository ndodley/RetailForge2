package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.OrderDto;
import com.retailforge2.backend.services.iservices.IOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class OrderController {

    private final IOrderService orderService;

    public OrderController(IOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderDto> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto createOrder(@RequestBody OrderDto orderDto) {
        return orderService.createOrder(orderDto.userId(), orderDto.address());
    }

    @GetMapping("/{orderId}")
    public OrderDto getOrderById(@PathVariable Integer orderId) {
        return orderService.getOrderById(orderId);
    }

    @GetMapping("/user/{userId}")
    public List<OrderDto> getAllOrdersByUserId(@PathVariable Integer userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping("/status/{status}")
    public List<OrderDto> getAllOrdersByStatus(@PathVariable String status) {
        return orderService.getOrdersByStatus(status);
    }

    @PutMapping("/{id}")
    public OrderDto updateOrder(@PathVariable Integer id, @RequestBody OrderDto orderDto) {
        return orderService.updateOrder(orderDto);
    }

    @PutMapping("/{id}/status")
    public OrderDto updateOrderStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return orderService.updateOrderStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrderById(id);
    }

}