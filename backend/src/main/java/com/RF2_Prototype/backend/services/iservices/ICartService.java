package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.CartDto;

public interface ICartService {
    CartDto getCartForCurrentUser();
    CartDto addItem(Integer productId, int quantity);
    CartDto updateQuantity(Integer productId, int quantity);
    CartDto removeItem(Integer productId);
    CartDto clearCart();
}
