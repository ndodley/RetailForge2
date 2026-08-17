package com.retailforge2.backend.services;

import com.retailforge2.backend.exception.CategoryNotFoundException;
import com.retailforge2.backend.exception.DepartmentNotFoundException;
import com.retailforge2.backend.mappers.CategoryMapper;
import com.retailforge2.backend.models.dtos.CategoryBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.CategoryDto;
import com.retailforge2.backend.models.entities.Category;
import com.retailforge2.backend.models.entities.Department;
import com.retailforge2.backend.repository.CategoryRepository;
import com.retailforge2.backend.repository.DepartmentRepository;
import com.retailforge2.backend.repository.ProductRepository;
import com.retailforge2.backend.services.iservices.ICategoryService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class CategoryService implements ICategoryService {

    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryMapper categoryMapper;
    private final ProductRepository productRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository,
            CategoryMapper categoryMapper,
            ProductRepository productRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
        this.categoryMapper = categoryMapper;
        this.productRepository = productRepository;
    }

    @Override
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toDtoWithCount)
                .toList();
    }

    @Override
    public CategoryDto getCategoryById(Integer id) {
        return toDtoWithCount(getCategoryEntity(id));
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        applyCategoryValues(category, categoryDto);
        return toDtoWithCount(categoryRepository.save(category));
    }

    @Override
    public CategoryDto updateCategory(Integer id, CategoryDto categoryDto) {
        Category category = getCategoryEntity(id);
        applyCategoryValues(category, categoryDto);
        return toDtoWithCount(categoryRepository.save(category));
    }

    @Override
    public int createCategoriesBulk(List<CategoryBulkUploadRowDto> rows) {
        // Re-uploading a CSV that overlaps with categories already created
        // (e.g. a broader "all departments" file after an earlier partial
        // upload) should not create duplicate rows. A category is treated
        // as the same one if its name matches an existing category within
        // the same department, case/whitespace-insensitively - dedup also
        // applies within the incoming batch itself, so a CSV with its own
        // repeated rows only inserts one copy.
        Set<String> seenKeys = new HashSet<>();
        for (Category existing : categoryRepository.findAll()) {
            seenKeys.add(categoryLookupKey(existing));
        }

        List<Category> categoriesToInsert = new ArrayList<>();
        for (CategoryBulkUploadRowDto row : rows) {
            Category candidate = toCategoryEntity(row);
            if (seenKeys.add(categoryLookupKey(candidate))) {
                categoriesToInsert.add(candidate);
            }
        }

        categoryRepository.saveAll(categoriesToInsert);
        return categoriesToInsert.size();
    }

    private String categoryLookupKey(Category category) {
        String departmentKey = category.getDepartment() == null
                ? ""
                : normalizeLookupKey(category.getDepartment().getName());
        return normalizeLookupKey(category.getName()) + "|" + departmentKey;
    }

    @Override
    public void deleteCategory(Integer id) {
        categoryRepository.delete(getCategoryEntity(id));
    }

    private CategoryDto toDtoWithCount(Category category) {
        long productCount = productRepository.countByCategory_Id(category.getId());
        return categoryMapper.toDto(category, productCount);
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

        String normalizedLookupKey = normalizeLookupKey(normalizedDepartmentName);
        List<Department> matches = departmentRepository.findAll()
                .stream()
                .filter(department -> normalizeLookupKey(department.getName()).equals(normalizedLookupKey))
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

    private String normalizeLookupKey(String departmentName) {
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
