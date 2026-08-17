package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.ProductBulkUploadRowDto;
import com.retailforge2.backend.models.dtos.ProductDto;
import com.retailforge2.backend.models.dtos.ProductUpsertRequest;

import java.util.List;

public interface IProductService {

    List<ProductDto> getProducts();

    ProductDto getProductById(Integer id);

    ProductDto createProduct(ProductUpsertRequest request);

    ProductDto updateProduct(Integer id, ProductUpsertRequest request);

    int createProductsBulk(List<ProductBulkUploadRowDto> rows);

    void deleteProduct(Integer id);
}

