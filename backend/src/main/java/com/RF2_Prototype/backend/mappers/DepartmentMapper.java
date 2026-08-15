package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.DepartmentDto;
import com.RF2_Prototype.backend.models.entities.Department;
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
