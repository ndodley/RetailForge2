package com.retailforge2.backend.services;

import com.retailforge2.backend.mappers.CartMapper;
import com.retailforge2.backend.models.dtos.CartDto;
import com.retailforge2.backend.models.entities.Cart;
import com.retailforge2.backend.models.entities.CartItem;
import com.retailforge2.backend.models.entities.Product;
import com.retailforge2.backend.models.entities.User;
import com.retailforge2.backend.repository.CartItemRepository;
import com.retailforge2.backend.repository.CartRepository;
import com.retailforge2.backend.repository.ProductRepository;
import com.retailforge2.backend.security.AuthenticatedUser;
import com.retailforge2.backend.services.iservices.ICartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartService implements ICartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

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

    // Same lookup-or-create as getOrCreateCart, but takes a pessimistic write lock on an
    // existing cart row (via CartRepository.findByUserIdForUpdate - the same locked query
    // OrderService.createOrder already uses). Every method here that WRITES to cart_items
    // (add/update/remove/clear) needs this instead of the unlocked helper: under concurrent
    // requests for the same shared cart, two unlocked reads can load the same in-memory
    // items list and race on insert/delete, which is what threw
    // DataIntegrityViolationException (duplicate key on ux_cart_items_cart_product) here and
    // would risk the same ObjectOptimisticLockingFailureException that OrderService hit on
    // clearCart's cascade delete. getCartForCurrentUser (a plain read) stays on the unlocked
    // helper since it doesn't modify anything and shouldn't block on other requests' locks.
    private Cart getOrCreateCartForUpdate(User user) {
        return cartRepository.findByUserIdForUpdate(user.getId())
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

        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartDto addItem(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUpdate(user);

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

        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartDto updateQuantity(Integer productId, int quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUpdate(user);

        CartItem item = cartItemRepository
                .findByCart_IdAndProduct_Id(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return cartMapper.toDto(cart);
    }

    @Override
    @Transactional
    public CartDto removeItem(Integer productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCartForUpdate(user);

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
        Cart cart = getOrCreateCartForUpdate(user);

        cart.getItems().clear();
        cartRepository.save(cart);

        return cartMapper.toDto(cart);
    }

}
