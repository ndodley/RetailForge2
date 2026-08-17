package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCart_IdAndProduct_Id(Integer cartId, Integer productId);
}
