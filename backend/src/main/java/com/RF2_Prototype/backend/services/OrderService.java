package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.CartItem;
import com.RF2_Prototype.backend.models.entities.Order;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.models.dtos.OrderItemDto;
import com.RF2_Prototype.backend.repository.CartRepository;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import com.RF2_Prototype.backend.repository.OrderRepository;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;

    @Override
    @Transactional
    public OrderDto createOrder(Integer userId, String address) {

        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        BigDecimal subtotal = cart.getItems().stream()
                .map(ci -> ci.getPriceAtTime().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(userId)
                .address(address)
                .total(subtotal)
                .status("paid")
                .createdAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();

        order = orderRepository.save(order);

        for (CartItem ci : cart.getItems()) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(ci.getProduct().getId())
                    .productName(ci.getProduct().getName())
                    .imagePath(ci.getProduct().getImagePath())
                    .price(ci.getPriceAtTime())
                    .quantity(ci.getQuantity())
                    .build();

            orderItemRepository.save(item);
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        return getOrder(order.getId());
    }

    @Override
    public OrderDto getOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        return new OrderDto(
                order.getId(),
                order.getUserId(),
                order.getAddress(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                items.stream()
                        .map(oi -> new OrderItemDto(
                                oi.getId(),
                                oi.getProductId(),
                                oi.getProductName(),
                                oi.getImagePath(),
                                oi.getPrice(),
                                oi.getQuantity()
                        ))
                        .collect(Collectors.toList())
        );
    }
}
