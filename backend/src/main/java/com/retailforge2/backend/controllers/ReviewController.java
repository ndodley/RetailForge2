package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.BulkOperationResultDto;
import com.retailforge2.backend.models.dtos.ReviewBulkUploadRequestDto;
import com.retailforge2.backend.models.dtos.ReviewDto;
import com.retailforge2.backend.services.iservices.IReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final IReviewService reviewService;

    public ReviewController(IReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<ReviewDto> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/{id}")
    public ReviewDto getReviewById(@PathVariable Integer id) {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewDto> getReviewsByProductId(@PathVariable Integer productId) {
        return reviewService.getReviewsByProductId(productId);
    }

    @GetMapping("/user/{userId}")
    public List<ReviewDto> getReviewsByUserId(@PathVariable Integer userId) {
        return reviewService.getReviewsByUserId(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto createReview(@Valid @RequestBody ReviewDto reviewDto) {
        return reviewService.createReview(reviewDto);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public BulkOperationResultDto createReviewsBulk(
            @Valid @RequestBody ReviewBulkUploadRequestDto requestDto
    ) {
        int inserted = reviewService.createReviewsBulk(requestDto.rows());
        return new BulkOperationResultDto(inserted);
    }

    @PutMapping("/{id}")
    public ReviewDto updateReview(
            @PathVariable Integer id,
            @Valid @RequestBody ReviewDto reviewDto
    ) {
        return reviewService.updateReview(id, reviewDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Integer id) {
        reviewService.deleteReviewById(id);
    }

}
