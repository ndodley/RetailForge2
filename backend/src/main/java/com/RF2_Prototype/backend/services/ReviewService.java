package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.ProductNotFoundException;
import com.RF2_Prototype.backend.exception.UserNotFoundException;
import com.RF2_Prototype.backend.mappers.ReviewMapper;
import com.RF2_Prototype.backend.models.dtos.ReviewBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.ReviewDto;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.Review;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.ProductRepository;
import com.RF2_Prototype.backend.repository.ReviewRepository;
import com.RF2_Prototype.backend.repository.UserRepository;
import com.RF2_Prototype.backend.services.iservices.IReviewService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ReviewMapper reviewMapper
    ) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.reviewMapper = reviewMapper;
    }

    @Override
    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Override
    public ReviewDto getReviewById(Integer id) {
        return reviewMapper.toDto(getReviewEntity(id));
    }

    @Override
    public List<ReviewDto> getReviewsByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return reviewRepository.findByUser(user)  // ✅ Changed from findByUser_id
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Override
    public List<ReviewDto> getReviewsByProductId(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        return reviewRepository.findByProduct(product)  // ✅ Changed from findByProduct_id
                .stream()
                .map(reviewMapper::toDto)
                .toList();
    }

    @Override
    public ReviewDto createReview(ReviewDto dto) {
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new ProductNotFoundException(dto.productId()));

        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new UserNotFoundException(dto.userId()));

        Review review = reviewMapper.toEntity(dto, product, user);
        return reviewMapper.toDto(reviewRepository.save(review));
    }

    @Override
    public ReviewDto updateReview(Integer id, ReviewDto dto) {
        Review existing = getReviewEntity(id);

        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new ProductNotFoundException(dto.productId()));

        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new UserNotFoundException(dto.userId()));

        existing.setProduct(product);  // ✅ Changed from setProductId
        existing.setUser(user);  // ✅ Changed from setUserId
        existing.setRating(dto.rating());
        existing.setComment(dto.comment());

        return reviewMapper.toDto(reviewRepository.save(existing));
    }

    @Override
    public int createReviewsBulk(List<ReviewBulkUploadRowDto> rows) {
        List<Review> reviews = rows.stream()
                .map(this::toReviewEntity)
                .toList();

        reviewRepository.saveAll(reviews);
        return reviews.size();
    }

    @Override
    public void deleteReviewById(Integer id) {
        reviewRepository.deleteById(id);
    }

    private Review toReviewEntity(ReviewBulkUploadRowDto row) {
        Product product = productRepository.findByName(row.productName())
                .orElseThrow(() -> new ProductNotFoundException(row.productName()));

        User user = userRepository.findByEmailIgnoreCase(row.userEmail())
                .orElseThrow(() -> new UserNotFoundException(row.userEmail()));

        Review review = new Review();
        review.setProduct(product);  // ✅ Changed from setProductId
        review.setUser(user);  // ✅ Changed from setUserId
        review.setRating(row.rating());
        review.setComment(row.comment() == null ? null : row.comment().trim());
        return review;
    }

    private Review getReviewEntity(Integer id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
    }
}