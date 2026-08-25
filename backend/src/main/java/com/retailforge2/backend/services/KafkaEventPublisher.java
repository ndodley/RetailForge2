package com.retailforge2.backend.services;

import com.retailforge2.backend.events.AuthEvent;
import com.retailforge2.backend.events.InventoryEvent;
import com.retailforge2.backend.events.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;

// Thin wrapper around KafkaTemplate - callers (PaymentService, AuthService,
// ProductService) just hand over the details of what happened and this
// builds the matching event and puts it on the right topic.
//
// Every method is a no-op when kafka.enabled=false, so it's always safe to
// call regardless of whether Kafka is actually turned on - callers never
// need to check the flag themselves. This class itself is NOT gated behind
// @ConditionalOnProperty like KafkaConfig is: the KafkaTemplate bean (see
// KafkaClientConfig) doesn't attempt any broker connection until something
// is actually sent, so it's safe to keep this bean unconditional and check
// the flag per-call instead.
@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    // Matches the KafkaTemplate<String, Object> bean defined explicitly in
    // KafkaClientConfig. (An earlier version of this class assumed Spring
    // Boot would autoconfigure a KafkaTemplate<Object, Object> bean on its
    // own - it didn't, on this Spring Boot / Spring for Apache Kafka version,
    // which crashed the app on startup the first time it was actually run.
    // Defining the bean explicitly removes the guesswork.)
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.enabled}")
    private boolean kafkaEnabled;

    @Value("${kafka.topic.orders}")
    private String ordersTopic;

    @Value("${kafka.topic.auth}")
    private String authTopic;

    @Value("${kafka.topic.inventory}")
    private String inventoryTopic;

    public void publishOrderCreated(Integer orderId, Integer userId, BigDecimal total, String status) {
        if (!kafkaEnabled) return;
        OrderCreatedEvent event = new OrderCreatedEvent(orderId, userId, total, status, Instant.now());
        kafkaTemplate.send(ordersTopic, String.valueOf(orderId), event);
    }

    public void publishAuthEvent(String email, String action, boolean success) {
        if (!kafkaEnabled) return;
        AuthEvent event = new AuthEvent(email, action, success, Instant.now());
        kafkaTemplate.send(authTopic, email, event);
    }

    public void publishInventoryEvent(Integer productId, String productName, Integer newStock, boolean lowStock) {
        if (!kafkaEnabled) return;
        InventoryEvent event = new InventoryEvent(productId, productName, newStock, lowStock, Instant.now());
        kafkaTemplate.send(inventoryTopic, String.valueOf(productId), event);
    }
}
