package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.Review;
import com.retailforge2.backend.models.entities.Product;
import com.retailforge2.backend.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByProduct(Product product);  // ✅ Changed from findByProduct_id
    List<Review> findByUser(User user);  // ✅ Changed from findByUser_id
}