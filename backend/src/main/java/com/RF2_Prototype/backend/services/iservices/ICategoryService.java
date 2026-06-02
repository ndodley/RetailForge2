package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.CategoryBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.CategoryDto;

import java.util.List;

public interface ICategoryService {

    List<CategoryDto> getCategories();

    CategoryDto getCategoryById(Integer id);

    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryDto updateCategory(Integer id, CategoryDto categoryDto);

    int createCategoriesBulk(List<CategoryBulkUploadRowDto> rows);

    void deleteCategory(Integer id);
}

