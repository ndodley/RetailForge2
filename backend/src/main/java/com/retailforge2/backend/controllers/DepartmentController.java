package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.BulkOperationResultDto;
import com.retailforge2.backend.models.dtos.DepartmentBulkUploadRequestDto;
import com.retailforge2.backend.models.dtos.DepartmentDto;
import com.retailforge2.backend.services.iservices.IDepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

	private final IDepartmentService departmentService;

	public DepartmentController(IDepartmentService departmentService) {
		this.departmentService = departmentService;
	}

	@GetMapping
	public List<DepartmentDto> getDepartments() {
		return departmentService.getDepartments();
	}

	@GetMapping("/{id}")
	public DepartmentDto getDepartment(@PathVariable Integer id) {
		return departmentService.getDepartmentById(id);
	}

	@PostMapping
	@org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
	public DepartmentDto createDepartment(@Valid @RequestBody DepartmentDto departmentDto) {
		return departmentService.createDepartment(departmentDto);
	}

	@PostMapping("/bulk")
	@org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
	public BulkOperationResultDto createDepartmentsBulk(@Valid @RequestBody DepartmentBulkUploadRequestDto requestDto) {
		return new BulkOperationResultDto(departmentService.createDepartmentsBulk(requestDto.rows()));
	}

	@PutMapping("/{id}")
	public DepartmentDto updateDepartment(@PathVariable Integer id, @Valid @RequestBody DepartmentDto departmentDto) {
		return departmentService.updateDepartment(id, departmentDto);
	}

	@DeleteMapping("/{id}")
	@org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteDepartment(@PathVariable Integer id) {
		departmentService.deleteDepartment(id);
	}
}
