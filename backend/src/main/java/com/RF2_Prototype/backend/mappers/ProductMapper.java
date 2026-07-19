package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.entities.Category;
import com.RF2_Prototype.backend.models.entities.Department;
import com.RF2_Prototype.backend.models.entities.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class ProductMapper {

    public ProductDto toDto(Product product) {
        Category category = product.getCategory();
        Department department = category == null ? null : category.getDepartment();

        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getBrand(),
                normalizeRating(product.getRating()),
                product.getPrice(),
                product.getDescription(),
                product.getStock(),
                product.getImagePath(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                department == null ? null : department.getId(),
                department == null ? null : department.getName()
        );
    }

    private BigDecimal normalizeRating(BigDecimal rating) {
        BigDecimal normalized = rating == null ? BigDecimal.ZERO : rating;
        return normalized.setScale(1, RoundingMode.HALF_UP);
    }
}
