package com.retailforge2.backend.services;

import com.retailforge2.backend.events.AuthEvent;
import com.retailforge2.backend.events.InventoryEvent;
import com.retailforge2.backend.events.OrderCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

// One listener method per topic. For now these just log what arrives - proving
// the whole publish -> broker -> consume pipeline actually works end to end.
// Nothing downstream depends on these logs yet; they're a stand-in for whatever
// real reaction (an email alert, a dashboard update, etc.) might get built later.
//
// Gated behind kafka.enabled, same as KafkaConfig - unlike KafkaEventPublisher,
// a listener container actively connects to and polls the broker as soon as the
// app starts, so this must NOT exist at all when Kafka is turned off (there'd be
// nothing to connect to, and Spring would keep retrying and logging errors).
@Component
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true")
public class KafkaEventListener {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventListener.class);

    @KafkaListener(topics = "${kafka.topic.orders}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("[rf2.orders] order #{} created - user={}, total={}, status={}, occurredAt={}",
                event.orderId(), event.userId(), event.total(), event.status(), event.occurredAt());
    }

    @KafkaListener(topics = "${kafka.topic.auth}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleAuthEvent(AuthEvent event) {
        log.info("[rf2.auth] {} attempt for {} - success={}, occurredAt={}",
                event.action(), event.email(), event.success(), event.occurredAt());
    }

    @KafkaListener(topics = "${kafka.topic.inventory}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleInventoryEvent(InventoryEvent event) {
        if (event.lowStock()) {
            log.warn("[rf2.inventory] LOW STOCK - product #{} ({}) now at {}, occurredAt={}",
                    event.productId(), event.productName(), event.newStock(), event.occurredAt());
        } else {
            log.info("[rf2.inventory] product #{} ({}) stock now {}, occurredAt={}",
                    event.productId(), event.productName(), event.newStock(), event.occurredAt());
        }
    }
}
