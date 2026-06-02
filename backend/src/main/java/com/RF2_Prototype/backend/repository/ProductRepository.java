package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}

