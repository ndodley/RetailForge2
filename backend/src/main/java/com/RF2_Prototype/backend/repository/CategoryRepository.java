package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    long countByDepartment_Id(Integer departmentId);
}
