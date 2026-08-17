package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.CategoryBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.CategoryDto;

import java.util.List;

public interface ICategoryService {

    List<CategoryDto> getCategories();

    CategoryDto getCategoryById(Integer id);

    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryDto updateCategory(Integer id, CategoryDto categoryDto);

    int createCategoriesBulk(List<CategoryBulkUploadRowDto> rows);

    void deleteCategory(Integer id);
}

