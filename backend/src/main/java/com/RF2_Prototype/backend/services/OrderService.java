package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.mappers.OrderMapper;
import com.RF2_Prototype.backend.models.entities.Cart;
import com.RF2_Prototype.backend.models.entities.CartItem;
import com.RF2_Prototype.backend.models.entities.Order;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.repository.CartRepository;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import com.RF2_Prototype.backend.repository.OrderRepository;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional
    public OrderDto createOrder(Integer userId, String address) {

        // Fetch the cart for the user
        Cart cart = cartRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if(cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create an order from an empty cart");
        }

        // Calculate the subtotal for the order
        BigDecimal subtotal = cart.getItems().stream()
                .map(ci -> ci.getPriceAtTime().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create the order entity and save it
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
            order.getItems().add(item);
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        return getOrderById(order.getId());
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto getOrderById(Integer orderId) {
        return orderMapper.toDto(getOrderEntity(orderId));
    }

    @Override
    public List<OrderDto> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto updateOrder(OrderDto orderDto) {
        Order order = getOrderEntity(orderDto.id());
        order.setAddress(orderDto.address());
        order.setTotal(orderDto.total());
        order.setStatus(orderDto.status());
        return orderMapper.toDto(orderRepository.save(order));
    }

    @Override
    public OrderDto updateOrderStatus(Integer orderId, String status) {
        Order order = getOrderEntity(orderId);
        order.setStatus(status);
        return orderMapper.toDto(orderRepository.save(order)); // save the updated order and return the DTO
    }

    @Override
    public void deleteOrderById(Integer orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }

    private Order getOrderEntity(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }
}
