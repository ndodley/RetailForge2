package com.retailforge2.backend.services;

import com.retailforge2.backend.mappers.OrderMapper;
import com.retailforge2.backend.models.entities.Cart;
import com.retailforge2.backend.models.entities.CartItem;
import com.retailforge2.backend.models.entities.Order;
import com.retailforge2.backend.models.entities.OrderItem;
import com.retailforge2.backend.models.entities.Product;
import com.retailforge2.backend.models.dtos.OrderDto;
import com.retailforge2.backend.repository.CartRepository;
import com.retailforge2.backend.repository.OrderItemRepository;
import com.retailforge2.backend.repository.OrderRepository;
import com.retailforge2.backend.repository.ProductRepository;
import com.retailforge2.backend.services.iservices.IOrderService;
import org.springframework.beans.factory.annotation.Value;
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
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final KafkaEventPublisher kafkaEventPublisher;

    @Value("${kafka.low-stock-threshold}")
    private int lowStockThreshold;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            OrderMapper orderMapper,
            KafkaEventPublisher kafkaEventPublisher
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.orderMapper = orderMapper;
        this.kafkaEventPublisher = kafkaEventPublisher;
    }

    @Override
    @Transactional
    public OrderDto createOrder(Integer userId, String address) {

        // Fetch the cart for the user with a pessimistic write lock (not the plain
        // findByUser_Id used elsewhere) - this serializes concurrent checkout attempts for
        // the same cart instead of letting them both load the same cart_items rows and race
        // to delete them, which previously threw ObjectOptimisticLockingFailureException
        // under load. A second concurrent request now simply waits for the first to commit,
        // then correctly sees the already-cleared cart and hits the empty-cart check below.
        Cart cart = cartRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        // IllegalArgumentException (not a plain RuntimeException) so GlobalExceptionHandler's
        // existing handler maps this to a clean HTTP 400 instead of a raw 500 error page.
        // This is reachable under real, non-malicious conditions - e.g. two concurrent
        // checkout requests for the same cart (a double-click, a retried request, or - as
        // load testing surfaced - many virtual users sharing one seeded account) - so it
        // needs to be a normal, expected error response rather than an unhandled crash.
        if(cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create an order from an empty cart");
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

            // Decrement stock for the purchased quantity. Floored at 0 defensively -
            // this doesn't attempt to reject checkout on insufficient stock (that's a
            // separate concern from recording the order), it just prevents the count
            // from going negative if stock and cart contents ever drift out of sync.
            Product product = ci.getProduct();
            product.setStock(Math.max(0, product.getStock() - ci.getQuantity()));
            productRepository.save(product);

            boolean lowStock = product.getStock() <= lowStockThreshold;
            kafkaEventPublisher.publishInventoryEvent(
                    product.getId(), product.getName(), product.getStock(), lowStock);
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
