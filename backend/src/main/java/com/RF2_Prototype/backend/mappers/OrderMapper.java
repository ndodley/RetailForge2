package com.RF2_Prototype.backend.mappers;

import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.models.dtos.OrderItemDto;
import com.RF2_Prototype.backend.models.entities.Order;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.ProductRepository;
import com.RF2_Prototype.backend.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {

    private static final String PLACEHOLDER_IMAGE_PATH = "/images/other_images/dummy_product.jpg";

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderMapper(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public OrderDto toDto(Order order) {
        if (order == null) {
            return null;
        }

        String userEmail = userRepository.findById(order.getUserId())
                .map(User::getEmail)
                .orElse("unknown@example.com");

        // Defensive: a freshly built (not-yet-persisted) Order can have a null items
        // collection depending on how it was constructed, so never trust it's non-null here.
        List<OrderItem> orderItems = order.getItems() == null ? List.of() : order.getItems();

        return new OrderDto(
                order.getId(),
                order.getUserId(),
                userEmail,
                order.getAddress(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                orderItems.stream()
                        .map(item -> new OrderItemDto(
                                item.getId(),
                                item.getProductId(),
                                item.getProductName(),
                                resolveImagePath(item),
                                item.getPrice(),
                                item.getQuantity(),
                                resolveBrand(item)
                        ))
                        .toList()
        );
    }

    /**
     * Order items snapshot their product's image at checkout time — correct for a real
     * purchase receipt. But when that snapshot is missing, or was captured before the
     * product had a real photo (so it's just the "coming soon" placeholder), prefer the
     * product's current image instead of showing a stale placeholder forever.
     */
    private String resolveImagePath(OrderItem item) {
        String snapshotPath = item.getImagePath();

        boolean needsLiveLookup = snapshotPath == null
                || snapshotPath.isBlank()
                || PLACEHOLDER_IMAGE_PATH.equals(snapshotPath);

        if (!needsLiveLookup) {
            return snapshotPath;
        }

        return productRepository.findById(item.getProductId())
                .map(Product::getImagePath)
                .filter(path -> path != null && !path.isBlank())
                .orElse(snapshotPath);
    }

    /**
     * Order items don't snapshot brand at checkout time, so look it up from the live
     * product record for display. Quietly falls back to null (frontend omits the badge)
     * if the product has since been deleted.
     */
    private String resolveBrand(OrderItem item) {
        return productRepository.findById(item.getProductId())
                .map(Product::getBrand)
                .filter(brand -> brand != null && !brand.isBlank())
                .orElse(null);
    }

    public Order toEntity(OrderDto dto) {
        if (dto == null) {
            return null;
        }

        Order order = new Order();
        order.setId(dto.id());
        order.setUserId(dto.userId());
        order.setAddress(dto.address());
        order.setTotal(dto.total());
        order.setStatus(dto.status());
        order.setCreatedAt(dto.createdAt());
        order.setItems(dto.items().stream()
                .map(itemDto -> {
                    OrderItem item = new OrderItem();
                    item.setId(itemDto.id());
                    item.setProductId(itemDto.productId());
                    item.setProductName(itemDto.productName());
                    item.setImagePath(itemDto.imagePath());
                    item.setPrice(itemDto.price());
                    item.setQuantity(itemDto.quantity());
                    return item;
                })
                .toList()
        );

        return order;
    }
}