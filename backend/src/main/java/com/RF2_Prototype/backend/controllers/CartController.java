package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.services.iservices.ICartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final ICartService cartService;

    public CartController(ICartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart() {
        return ResponseEntity.ok(cartService.getCartForCurrentUser());
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(
            @RequestParam Integer productId,
            @RequestParam(defaultValue = "1") int quantity
    ) {
        return ResponseEntity.ok(cartService.addItem(productId, quantity));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<CartDto> updateQuantity(
            @PathVariable Integer productId,
            @RequestParam int quantity
    ) {
        return ResponseEntity.ok(cartService.updateQuantity(productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDto> removeItem(@PathVariable Integer productId) {
        return ResponseEntity.ok(cartService.removeItem(productId));
    }

    @DeleteMapping
    public ResponseEntity<CartDto> clearCart() {
        return ResponseEntity.ok(cartService.clearCart());
    }
}
