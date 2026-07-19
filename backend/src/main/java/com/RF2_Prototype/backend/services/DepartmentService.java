package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.DepartmentNotFoundException;
import com.RF2_Prototype.backend.mappers.DepartmentMapper;
import com.RF2_Prototype.backend.models.dtos.DepartmentBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.DepartmentDto;
import com.RF2_Prototype.backend.models.entities.Department;
import com.RF2_Prototype.backend.repository.DepartmentRepository;
import com.RF2_Prototype.backend.services.iservices.IDepartmentService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class DepartmentService implements IDepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(DepartmentRepository departmentRepository, DepartmentMapper departmentMapper) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    @Override
    public List<DepartmentDto> getDepartments() {
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(departmentMapper::toDto)
                .toList();
    }

    @Override
    public DepartmentDto getDepartmentById(Integer id) {
        return departmentMapper.toDto(getDepartmentEntity(id));
    }

    @Override
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        return departmentMapper.toDto(departmentRepository.save(buildDepartment(departmentDto.name())));
    }

    @Override
    public int createDepartmentsBulk(List<DepartmentBulkUploadRowDto> rows) {
        List<Department> departments = rows.stream()
                .map(row -> buildDepartment(row.name()))
                .toList();

        departmentRepository.saveAll(departments);
        return departments.size();
    }

    @Override
    public DepartmentDto updateDepartment(Integer id, DepartmentDto departmentDto) {
        Department department = getDepartmentEntity(id);
        department.setName(normalizeName(departmentDto.name()));

        return departmentMapper.toDto(departmentRepository.save(department));
    }

    @Override
    public void deleteDepartment(Integer id) {
        Department department = getDepartmentEntity(id);
        departmentRepository.delete(department);
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
