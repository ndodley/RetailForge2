package com.retailforge2.backend.mappers;

import com.retailforge2.backend.models.dtos.DepartmentDto;
import com.retailforge2.backend.models.entities.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public DepartmentDto toDto(Department department, long categoryCount, long productCount) {
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                (int) categoryCount,
                (int) productCount
        );
    }
}
