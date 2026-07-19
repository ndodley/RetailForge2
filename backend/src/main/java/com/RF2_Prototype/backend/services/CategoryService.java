package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.CategoryNotFoundException;
import com.RF2_Prototype.backend.exception.DepartmentNotFoundException;
import com.RF2_Prototype.backend.mappers.CategoryMapper;
import com.RF2_Prototype.backend.models.dtos.CategoryBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.CategoryDto;
import com.RF2_Prototype.backend.models.entities.Category;
import com.RF2_Prototype.backend.models.entities.Department;
import com.RF2_Prototype.backend.repository.CategoryRepository;
import com.RF2_Prototype.backend.repository.DepartmentRepository;
import com.RF2_Prototype.backend.services.iservices.ICategoryService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CategoryService implements ICategoryService {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository,
            CategoryMapper categoryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    @Override
    public CategoryDto getCategoryById(Integer id) {
        return categoryMapper.toDto(getCategoryEntity(id));
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        applyCategoryValues(category, categoryDto);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    public CategoryDto updateCategory(Integer id, CategoryDto categoryDto) {
        Category category = getCategoryEntity(id);
        applyCategoryValues(category, categoryDto);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Override
    public int createCategoriesBulk(List<CategoryBulkUploadRowDto> rows) {
        List<Category> categories = rows.stream()
                .map(this::toCategoryEntity)
                .toList();

        categoryRepository.saveAll(categories);
        return categories.size();
    }

    @Override
    public void deleteCategory(Integer id) {
        categoryRepository.delete(getCategoryEntity(id));
    }

    private void applyCategoryValues(Category category, CategoryDto categoryDto) {
        category.setName(categoryDto.name().trim());
        category.setDescription(categoryDto.description().trim());
        category.setDepartment(getDepartmentEntity(categoryDto.departmentId()));
    }

    private Category toCategoryEntity(CategoryBulkUploadRowDto row) {
        Category category = new Category();
        category.setName(row.name().trim());
        category.setDescription(row.description().trim());
        category.setDepartment(resolveDepartment(row.departmentId(), row.departmentName()));
        return category;
    }

    private Department resolveDepartment(Integer departmentId, String departmentName) {
        if (departmentId != null) {
            return getDepartmentEntity(departmentId);
        }

        String normalizedDepartmentName = departmentName == null ? "" : departmentName.trim();
        if (normalizedDepartmentName.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Each category row requires name, description, and department_name.");
        }

        String normalizedLookupKey = normalizeDepartmentLookupKey(normalizedDepartmentName);
        List<Department> matches = departmentRepository.findAll()
                .stream()
                .filter(department -> normalizeDepartmentLookupKey(department.getName()).equals(normalizedLookupKey))
                .toList();

        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No department found for department_name=\"" + normalizedDepartmentName + "\".");
        }
        if (matches.size() > 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Multiple departments found for department_name=\"" + normalizedDepartmentName + "\".");
        }

        return matches.getFirst();
    }

    private String normalizeDepartmentLookupKey(String departmentName) {
        return departmentName == null
                ? ""
                : departmentName
                .trim()
                .toLowerCase()
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Category getCategoryEntity(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    private Department getDepartmentEntity(Integer id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));
    }

}

