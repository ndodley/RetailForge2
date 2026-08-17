package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.FavoriteDto;
import com.retailforge2.backend.models.dtos.ProductDto;

import java.util.List;

public interface IFavoriteService {

    List<ProductDto> getFavoriteProductsByUserId(Integer userId);

    List<Integer> getFavoriteProductIdsByUserId(Integer userId);

    FavoriteDto addFavorite(Integer userId, Integer productId);

    void removeFavorite(Integer userId, Integer productId);

    boolean isFavorite(Integer userId, Integer productId);
}
