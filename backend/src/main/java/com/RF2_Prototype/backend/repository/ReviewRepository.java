package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Review;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    List<Review> findByProduct(Product product);  // ✅ Changed from findByProduct_id
    List<Review> findByUser(User user);  // ✅ Changed from findByUser_id
}