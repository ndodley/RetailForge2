package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.models.dtos.BulkOperationResultDto;
import com.RF2_Prototype.backend.models.dtos.ProductBulkUploadRequestDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.dtos.ProductUpsertRequest;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final IProductService productService;

    public ProductController(IProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDto> getProducts() {
        return productService.getProducts();
    }

    @GetMapping("/{id}")
    public ProductDto getProduct(@PathVariable Integer id) {
        return productService.getProductById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@Valid @ModelAttribute ProductUpsertRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductDto updateProduct(@PathVariable Integer id, @Valid @ModelAttribute ProductUpsertRequest request) {
        return productService.updateProduct(id, request);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public BulkOperationResultDto createProductsBulk(@Valid @RequestBody ProductBulkUploadRequestDto requestDto) {
        return new BulkOperationResultDto(productService.createProductsBulk(requestDto.rows()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
    }
}

