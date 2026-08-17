package com.retailforge2.backend.models.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;  // ✅ Changed from product_id to product

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  // ✅ Changed from user_id to user

    @Column(name = "rating")
    private BigDecimal rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Review() {}

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /* Getters and Setters */

    // Get ID
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    // Get Product
    public Product getProduct() { return product; }  // ✅ Changed getter name
    public void setProduct(Product product) { this.product = product; }  // ✅ Changed setter name

    // Get User
    public User getUser() { return user; }  // ✅ Changed getter name
    public void setUser(User user) { this.user = user; }  // ✅ Changed setter name

    // Get Rating
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    // Get Comment
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    // Get Created At
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Get Updated At
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}