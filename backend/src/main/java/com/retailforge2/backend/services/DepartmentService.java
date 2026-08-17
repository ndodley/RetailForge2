package com.retailforge2.backend.services;

import com.retailforge2.backend.exception.DepartmentNotFoundException;
import com.retailforge2.backend.mappers.DepartmentMapper;
import com.retailforge2.backend.models.dtos.DepartmentBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.DepartmentDto;
import com.retailforge2.backend.models.entities.Department;
import com.retailforge2.backend.repository.CategoryRepository;
import com.retailforge2.backend.repository.DepartmentRepository;
import com.retailforge2.backend.repository.ProductRepository;
import com.retailforge2.backend.services.iservices.IDepartmentService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class DepartmentService implements IDepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            DepartmentMapper departmentMapper,
            CategoryRepository categoryRepository,
            ProductRepository productRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<DepartmentDto> getDepartments() {
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toDtoWithCounts)
                .toList();
    }

    @Override
    public DepartmentDto getDepartmentById(Integer id) {
        return toDtoWithCounts(getDepartmentEntity(id));
    }

    @Override
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        return toDtoWithCounts(departmentRepository.save(buildDepartment(departmentDto.name())));
    }

    @Override
    public int createDepartmentsBulk(List<DepartmentBulkUploadRowDto> rows) {
        // Same idempotency guard as CategoryService.createCategoriesBulk -
        // re-uploading a CSV that overlaps with departments already created
        // should not create duplicate rows, case/whitespace-insensitively,
        // and duplicates within the incoming batch collapse to one insert.
        Set<String> seenNames = new HashSet<>();
        for (Department existing : departmentRepository.findAll()) {
            seenNames.add(normalizeLookupKey(existing.getName()));
        }

        List<Department> departmentsToInsert = new ArrayList<>();
        for (DepartmentBulkUploadRowDto row : rows) {
            Department candidate = buildDepartment(row.name());
            if (seenNames.add(normalizeLookupKey(candidate.getName()))) {
                departmentsToInsert.add(candidate);
            }
        }

        departmentRepository.saveAll(departmentsToInsert);
        return departmentsToInsert.size();
    }

    private String normalizeLookupKey(String name) {
        return name == null
                ? ""
                : name
                .trim()
                .toLowerCase()
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    @Override
    public DepartmentDto updateDepartment(Integer id, DepartmentDto departmentDto) {
        Department department = getDepartmentEntity(id);
        department.setName(normalizeName(departmentDto.name()));

        return toDtoWithCounts(departmentRepository.save(department));
    }

    @Override
    public void deleteDepartment(Integer id) {
        Department department = getDepartmentEntity(id);
        departmentRepository.delete(department);
    }

    private DepartmentDto toDtoWithCounts(Department department) {
        long categoryCount = categoryRepository.countByDepartment_Id(department.getId());
        long productCount = productRepository.countByCategory_Department_Id(department.getId());
        return departmentMapper.toDto(department, categoryCount, productCount);
    }

    private Department getDepartmentEntity(Integer id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new DepartmentNotFoundException(id));
    }

    private Department buildDepartment(String name) {
        Department department = new Department();
        department.setName(normalizeName(name));
        return department;
    }

    private String normalizeName(String name) {
        return name.trim();
    }
}
