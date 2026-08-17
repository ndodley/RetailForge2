package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findByName(String name);

    long countByCategory_Id(Integer categoryId);

    long countByCategory_Department_Id(Integer departmentId);
}
