package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.models.dtos.OrderItemDto;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import com.RF2_Prototype.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailsController {

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemDto>> getOrderItems(@PathVariable Integer orderId) {

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        List<OrderItemDto> dto = items.stream()
                .map(oi -> new OrderItemDto(
                        oi.getId(),
                        oi.getProductId(),
                        oi.getProductName(),
                        oi.getImagePath(),
                        oi.getPrice(),
                        oi.getQuantity(),
                        resolveBrand(oi.getProductId())
                ))
                .toList();

        return ResponseEntity.ok(dto);
    }

    /**
     * Order items only snapshot product name/image/price at checkout time — brand isn't
     * stored on the order item itself, so look it up from the live product record for
     * display. If the product has since been deleted, this quietly falls back to null
     * and the frontend just omits the badge rather than erroring.
     */
    private String resolveBrand(Integer productId) {
        return productRepository.findById(productId)
                .map(Product::getBrand)
                .filter(brand -> brand != null && !brand.isBlank())
                .orElse(null);
    }
}
