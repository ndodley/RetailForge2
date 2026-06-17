package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.OrderDto;

public interface IOrderService {
    OrderDto createOrder(Integer userId, String address);
    OrderDto getOrder(Integer orderId);
}
