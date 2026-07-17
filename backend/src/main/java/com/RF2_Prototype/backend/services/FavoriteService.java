package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.ProductNotFoundException;
import com.RF2_Prototype.backend.exception.UserNotFoundException;
import com.RF2_Prototype.backend.mappers.FavoriteMapper;
import com.RF2_Prototype.backend.models.dtos.FavoriteDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.entities.Favorite;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.FavoriteRepository;
import com.RF2_Prototype.backend.repository.ProductRepository;
import com.RF2_Prototype.backend.repository.UserRepository;
import com.RF2_Prototype.backend.services.iservices.IFavoriteService;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class FavoriteService implements IFavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FavoriteMapper favoriteMapper;
    private final IProductService productService;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            FavoriteMapper favoriteMapper,
            IProductService productService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.favoriteMapper = favoriteMapper;
        this.productService = productService;
    }

    @Override
    public List<ProductDto> getFavoriteProductsByUserId(Integer userId) {
        User user = getUserEntity(userId);
        return favoriteRepository.findByUser(user).stream()
                .map(favorite -> productService.getProductById(favorite.getProduct().getId()))
                .toList();
    }

    @Override
    public List<Integer> getFavoriteProductIdsByUserId(Integer userId) {
        User user = getUserEntity(userId);
        return favoriteRepository.findByUser(user).stream()
                .map(favorite -> favorite.getProduct().getId())
                .toList();
    }

    @Override
    public FavoriteDto addFavorite(Integer userId, Integer productId) {
        User user = getUserEntity(userId);
        Product product = getProductEntity(productId);

        Favorite favorite = favoriteRepository.findByUserAndProduct(user, product)
                .orElseGet(() -> {
                    Favorite created = new Favorite();
                    created.setUser(user);
                    created.setProduct(product);
                    return favoriteRepository.save(created);
                });

        return favoriteMapper.toDto(favorite);
    }

    @Override
    public void removeFavorite(Integer userId, Integer productId) {
        User user = getUserEntity(userId);
        Product product = getProductEntity(productId);
        favoriteRepository.deleteByUserAndProduct(user, product);
    }

    @Override
    public boolean isFavorite(Integer userId, Integer productId) {
        User user = getUserEntity(userId);
        Product product = getProductEntity(productId);
        return favoriteRepository.existsByUserAndProduct(user, product);
    }

    private User getUserEntity(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private Product getProductEntity(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
