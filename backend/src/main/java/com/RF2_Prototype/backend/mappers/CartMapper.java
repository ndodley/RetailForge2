package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.models.dtos.CartItemDto;
import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CartMapper {

    public CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream()
                .map(this::toItemDto)
                .toList();

        BigDecimal subtotal = items.stream()
                .map(item -> item.priceAtTime().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemDto::quantity)
                .sum();

        return new CartDto(
                cart.getId(),
                cart.getUser().getId(),
                items,
                subtotal,
                totalItems
        );
    }

    private CartItemDto toItemDto(CartItem item) {
        return new CartItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImagePath(),
                item.getPriceAtTime(),
                item.getQuantity(),
                item.getProduct().getStock()
        );
    }
}
