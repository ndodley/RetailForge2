package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.models.dtos.CartItemDto;
import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.CartItem;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.CartItemRepository;
import com.RF2_Prototype.backend.repository.CartRepository;
import com.RF2_Prototype.backend.repository.ProductRepository;
import com.RF2_Prototype.backend.security.AuthenticatedUser;
import com.RF2_Prototype.backend.services.iservices.ICartService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService implements ICartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("AUTH = " + authentication);
        if (authentication == null) {
            throw new IllegalStateException("No authentication found");
        }

        System.out.println("PRINCIPAL = " + authentication.getPrincipal());

        if (!(authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalStateException("Invalid principal type: " + authentication.getPrincipal());
        }

        return authenticatedUser.getUser();
    }

    private Cart getOrCreateCartForUser(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setItems(new ArrayList<>());
                    return cartRepository.save(cart);
                });
    }

    @Override
    @Transactional
    public CartDto getCartForCurrentUser() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUser(user);

        List<CartItem> rawItems = cart.getItems() != null ? cart.getItems() : new ArrayList<>();

        List<CartItemDto> items = rawItems.stream()
                .map(ci -> {
                    Product p = ci.getProduct();
                    if (p == null) return null;

                    String categoryName = p.getCategory() != null ? p.getCategory().getName() : null;

                    return new CartItemDto(
                            ci.getId(),
                            p.getId(),
                            p.getName(),
                            categoryName,
                            p.getImagePath(),
                            ci.getPriceAtTime(),
                            ci.getQuantity(),
                            p.getStock()
                    );
                })
                .filter(i -> i != null)
                .toList();

        double subtotal = items.stream()
                .mapToDouble(i -> {
                    double price = i.price() != null ? i.price().doubleValue() : 0.0;
                    int qty = i.quantity() > 0 ? i.quantity() : 0;
                    return price * qty;
                })
                .sum();

        int totalItems = items.stream()
                .mapToInt(i -> Math.max(i.quantity(), 0))
                .sum();

        return new CartDto(cart.getId(), items, subtotal, totalItems);
    }

    @Override
    @Transactional
    public CartDto addItem(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUser(user);

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

        return getCartForCurrentUser();
    }

    @Override
    @Transactional
    public CartDto updateQuantity(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUser(user);

        CartItem item = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item); // ⭐ FIX
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCartForCurrentUser();
    }

    @Override
    @Transactional
    public CartDto removeItem(Integer productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUser(user);

        cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), productId)
                .ifPresent(item -> {
                    cart.getItems().remove(item); // ⭐ CRITICAL FIX
                    cartItemRepository.delete(item);
                });

        return getCartForCurrentUser();
    }

    @Override
    @Transactional
    public CartDto clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUser(user);

        cartItemRepository.deleteAll(cart.getItems()); // ⭐ delete rows
        cart.getItems().clear();                       // ⭐ clear list

        return getCartForCurrentUser();
    }
}
