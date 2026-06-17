package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.models.dtos.CartItemDto;
import com.RF2_Prototype.backend.models.entities.*;
import com.RF2_Prototype.backend.repository.*;
import com.RF2_Prototype.backend.security.AuthenticatedUser;
import com.RF2_Prototype.backend.services.iservices.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService implements ICartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser au)) {
            throw new IllegalStateException("No authenticated user found");
        }
        return au.getUser();
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    return cartRepository.save(c);
                });
    }

    @Override
    @Transactional
    public CartDto getCartForCurrentUser() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto addItem(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), productId)
                .orElseGet(() -> {
                    CartItem ci = new CartItem();
                    ci.setCart(cart);
                    ci.setProduct(product);
                    ci.setQuantity(0);
                    ci.setPriceAtTime(product.getPrice());
                    return ci;
                });

        item.setQuantity(item.getQuantity() + quantity);
        cartItemRepository.save(item);

        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateQuantity(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return toDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeItem(Integer productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), productId)
                .ifPresent(item -> {
                    cart.getItems().remove(item);   // ⭐ remove from in-memory list
                    cartItemRepository.delete(item); // ⭐ remove from DB
                });

        return getCartForCurrentUser(); // ⭐ reload fresh cart
    }

    @Override
    @Transactional
    public CartDto clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        cart.getItems().clear();
        cartRepository.save(cart);

        return toDto(cart);
    }

    private CartDto toDto(Cart cart) {
        var items = cart.getItems().stream()
                .map(ci -> new CartItemDto(
                        ci.getId(),
                        ci.getProduct().getId(),
                        ci.getProduct().getName(),
                        ci.getProduct().getImagePath(),
                        ci.getPriceAtTime(),
                        ci.getQuantity(),
                        ci.getProduct().getStock()
                ))
                .collect(Collectors.toList());

        // BigDecimal subtotal calculation
        BigDecimal subtotal = items.stream()
                .map(i -> i.priceAtTime().multiply(BigDecimal.valueOf(i.quantity())))
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
}
