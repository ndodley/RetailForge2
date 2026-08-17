package com.retailforge2.backend.mappers;

import com.retailforge2.backend.models.dtos.CategoryDto;
import com.retailforge2.backend.models.entities.Category;
import com.retailforge2.backend.models.entities.Department;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category, long productCount) {
        Department department = category.getDepartment();
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                department == null ? null : department.getId(),
                department == null ? null : department.getName(),
                (int) productCount
        );
    }
}
