package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findByName(String name);

    long countByCategory_Id(Integer categoryId);

    long countByCategory_Department_Id(Integer departmentId);
}
