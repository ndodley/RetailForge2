package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.FavoriteDto;
import com.retailforge2.backend.models.dtos.ProductDto;
import com.retailforge2.backend.services.iservices.IFavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final IFavoriteService favoriteService;

    public FavoriteController(IFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping("/user/{userId}")
    public List<ProductDto> getFavoriteProducts(@PathVariable Integer userId) {
        return favoriteService.getFavoriteProductsByUserId(userId);
    }

    @GetMapping("/user/{userId}/ids")
    public List<Integer> getFavoriteProductIds(@PathVariable Integer userId) {
        return favoriteService.getFavoriteProductIdsByUserId(userId);
    }

    @GetMapping("/user/{userId}/product/{productId}")
    public boolean isFavorite(@PathVariable Integer userId, @PathVariable Integer productId) {
        return favoriteService.isFavorite(userId, productId);
    }

    @PostMapping("/user/{userId}/product/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FavoriteDto addFavorite(@PathVariable Integer userId, @PathVariable Integer productId) {
        return favoriteService.addFavorite(userId, productId);
    }

    @DeleteMapping("/user/{userId}/product/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Integer userId, @PathVariable Integer productId) {
        favoriteService.removeFavorite(userId, productId);
    }
}
