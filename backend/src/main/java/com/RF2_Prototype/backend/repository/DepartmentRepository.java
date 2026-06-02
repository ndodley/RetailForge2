package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
	List<Department> findAllByNameIgnoreCase(String name);
}
