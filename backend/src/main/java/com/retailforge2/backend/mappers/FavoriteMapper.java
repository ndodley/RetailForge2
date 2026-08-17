package com.retailforge2.backend.mappers;

import com.retailforge2.backend.models.dtos.FavoriteDto;
import com.retailforge2.backend.models.entities.Favorite;
import org.springframework.stereotype.Component;

@Component
public class FavoriteMapper {

    public FavoriteDto toDto(Favorite favorite) {
        return new FavoriteDto(
                favorite.getId(),
                favorite.getUser().getId(),
                favorite.getProduct().getId(),
                favorite.getCreatedAt()
        );
    }
}
