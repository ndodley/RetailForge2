package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.ReviewBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.ReviewDto;
import java.util.List;

public interface IReviewService {

    List<ReviewDto> getAllReviews();

    ReviewDto getReviewById(Integer id);

    List<ReviewDto> getReviewsByUserId(Integer userId);

    List<ReviewDto> getReviewsByProductId(Integer productId);

    ReviewDto createReview(ReviewDto reviewDto);

    ReviewDto updateReview(Integer id, ReviewDto reviewDto);

    int createReviewsBulk(List<ReviewBulkUploadRowDto> rows);

    void deleteReviewById(Integer id);
}
