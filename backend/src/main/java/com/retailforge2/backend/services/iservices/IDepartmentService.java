package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.DepartmentBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.DepartmentDto;

import java.util.List;

public interface IDepartmentService {

    List<DepartmentDto> getDepartments();

    DepartmentDto getDepartmentById(Integer id);

    DepartmentDto createDepartment(DepartmentDto departmentDto);

    int createDepartmentsBulk(List<DepartmentBulkUploadRowDto> rows);

    DepartmentDto updateDepartment(Integer id, DepartmentDto departmentDto);

    void deleteDepartment(Integer id);
}
