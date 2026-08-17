package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.CartDto;

public interface ICartService {
    CartDto getCartForCurrentUser();
    CartDto addItem(Integer productId, int quantity);
    CartDto updateQuantity(Integer productId, int quantity);
    CartDto removeItem(Integer productId);
    CartDto clearCart();
}
