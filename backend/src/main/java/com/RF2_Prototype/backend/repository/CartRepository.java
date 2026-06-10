package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser(User user);
}
