package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCart_IdAndProduct_Id(Integer cartId, Integer productId);
}
