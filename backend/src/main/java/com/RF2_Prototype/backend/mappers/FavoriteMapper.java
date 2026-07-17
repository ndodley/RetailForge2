package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.FavoriteDto;
import com.RF2_Prototype.backend.models.entities.Favorite;
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
