package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.models.dtos.OrderItemDto;
import com.RF2_Prototype.backend.models.entities.Order;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }

        return new OrderDto(
                order.getId(),
                order.getUserId(),
                order.getAddress(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(item -> new OrderItemDto(
                                item.getId(),
                                item.getProductId(),
                                item.getProductName(),
                                item.getImagePath(),
                                item.getPrice(),
                                item.getQuantity()
                        ))
                        .toList()
        );

    }

    public Order toEntity(OrderDto dto) {
        if (dto == null) {
            return null;
        }

        Order order = new Order();
        order.setId(dto.id());
        order.setUserId(dto.userId());
        order.setAddress(dto.address());
        order.setTotal(dto.total());
        order.setStatus(dto.status());
        order.setCreatedAt(dto.createdAt());
        order.setItems(dto.items().stream()
                .map(itemDto -> {
                    OrderItem item = new OrderItem();
                    item.setId(itemDto.id());
                    item.setProductId(itemDto.productId());
                    item.setProductName(itemDto.productName());
                    item.setImagePath(itemDto.imagePath());
                    item.setPrice(itemDto.price());
                    item.setQuantity(itemDto.quantity());
                    return item;
                })
                .toList()
        );

        return order;
    }

}
