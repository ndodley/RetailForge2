package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
	List<Department> findAllByNameIgnoreCase(String name);
}
