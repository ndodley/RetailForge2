package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.ReviewDto;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.Review;
import com.RF2_Prototype.backend.models.entities.User;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewDto toDto(Review review) {
        User user = review.getUser();  // ✅ Changed from getUserId()
        String fullName = user.getFirstName() + " " + user.getLastName();

        return new ReviewDto(
                review.getId(),
                review.getProduct().getId(),  // ✅ Changed from getProductId()
                review.getProduct().getName(),
                review.getProduct().getImagePath(),
                user.getId(),
                user.getEmail(),
                fullName,
                user.getAvatar_path(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public Review toEntity(ReviewDto dto, Product product, User user) {
        Review review = new Review();
        review.setProduct(product);  // ✅ Changed from setProductId
        review.setUser(user);  // ✅ Changed from setUserId
        review.setRating(dto.rating());
        review.setComment(dto.comment());
        return review;
    }
}
