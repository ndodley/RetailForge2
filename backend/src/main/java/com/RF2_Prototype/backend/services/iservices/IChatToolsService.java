package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.ProductAvailabilityDto;

import java.util.List;

public interface IChatToolsService {

    // The @Tool/@ToolParam metadata Spring AI reads for function-calling lives
    // on the implementation's method (reflection sees the concrete class, not
    // this interface), so this contract is just the plain method signatures.
    List<ProductAvailabilityDto> searchProducts(String keyword);

    String getMyCart();

    String getMyOrders();

    String getMyFavorites();

    String addToCart(String productName, Integer quantity);

    String updateCartQuantity(String productName, int quantity);

    String removeFromCart(String productName);

    String addFavorite(String productName);

    String removeFavorite(String productName);

    String getPopularProducts();

    String getProductReviews(String productName);
}
