package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    // Use entity field paths: cart.id and product.id
    Optional<CartItem> findByCart_IdAndProduct_Id(Integer cartId, Integer productId);

    void deleteByCart_IdAndProduct_Id(Integer cartId, Integer productId);
}
