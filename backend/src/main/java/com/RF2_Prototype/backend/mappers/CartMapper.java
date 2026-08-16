package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.models.dtos.CartItemDto;
import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.CartItem;
import com.RF2_Prototype.backend.models.entities.Category;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Component
public class CartMapper {

    public CartDto toDto(Cart cart) {
        // Defensive: a freshly built (not-yet-persisted) Cart can have a null items
        // collection depending on how it was constructed, so never trust it's non-null here.
        List<CartItem> cartItems = cart.getItems() == null ? Collections.emptyList() : cart.getItems();

        List<CartItemDto> items = cartItems.stream()
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
        Category category = item.getProduct().getCategory();

        return new CartItemDto(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getBrand(),
                category == null ? null : category.getName(),
                item.getProduct().getImagePath(),
                item.getPriceAtTime(),
                item.getQuantity(),
                item.getProduct().getStock()
        );
    }
}
