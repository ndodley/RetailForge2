package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.ProductBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.dtos.ProductUpsertRequest;

import java.util.List;

public interface IProductService {

    List<ProductDto> getProducts();

    ProductDto getProductById(Integer id);

    ProductDto createProduct(ProductUpsertRequest request);

    ProductDto updateProduct(Integer id, ProductUpsertRequest request);

    int createProductsBulk(List<ProductBulkUploadRowDto> rows);

    void deleteProduct(Integer id);
}

