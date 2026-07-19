package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.CategoryDto;
import com.RF2_Prototype.backend.models.entities.Category;
import com.RF2_Prototype.backend.models.entities.Department;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category) {
        Department department = category.getDepartment();
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getDescription(),
                department == null ? null : department.getId(),
                department == null ? null : department.getName()
        );
    }
}
