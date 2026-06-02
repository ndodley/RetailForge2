package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.DepartmentBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.DepartmentDto;

import java.util.List;

public interface IDepartmentService {

    List<DepartmentDto> getDepartments();

    DepartmentDto getDepartmentById(Integer id);

    DepartmentDto createDepartment(DepartmentDto departmentDto);

    int createDepartmentsBulk(List<DepartmentBulkUploadRowDto> rows);

    DepartmentDto updateDepartment(Integer id, DepartmentDto departmentDto);

    void deleteDepartment(Integer id);
}
