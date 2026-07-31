package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.ProductAvailabilityDto;

import java.util.List;

public interface IChatToolsService {

    // The @Tool/@ToolParam metadata Spring AI reads for function-calling lives
    // on the implementation's method (reflection sees the concrete class, not
    // this interface), so this contract is just the plain method signature.
    List<ProductAvailabilityDto> searchProducts(String keyword);
}
