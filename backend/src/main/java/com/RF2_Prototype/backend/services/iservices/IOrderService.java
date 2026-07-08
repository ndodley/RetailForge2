package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.OrderDto;

import java.util.List;

public interface IOrderService {
    OrderDto createOrder(Integer userId, String address);

    OrderDto getOrderById(Integer orderId);
    OrderDto updateOrder(OrderDto orderDto);
    OrderDto updateOrderStatus(Integer orderId, String status);
    void deleteOrderById(Integer orderId);

    // ⭐ ADDED FOR ADMIN
    List<OrderDto> getAllOrders();
    List<OrderDto> getOrdersByUserId(Integer userId);
    List<OrderDto> getOrdersByStatus(String status);

}
