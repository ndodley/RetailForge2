package com.retailforge2.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

// Only activates when kafka.enabled=true (see application.properties) - when
// it's false, none of these beans exist and the app runs exactly as it did
// before Kafka was added, with no broker connection attempted.
@Configuration
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true")
public class KafkaConfig {

    @Value("${kafka.topic.orders}")
    private String ordersTopicName;

    @Value("${kafka.topic.auth}")
    private String authTopicName;

    @Value("${kafka.topic.inventory}")
    private String inventoryTopicName;

    // Declaring topics as beans makes Spring Kafka create them on startup
    // (via the admin client) if they don't already exist on the broker,
    // rather than relying on the broker's own auto-create behavior.
    @Bean
    public NewTopic ordersTopic() {
        return TopicBuilder.name(ordersTopicName).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic authTopic() {
        return TopicBuilder.name(authTopicName).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic inventoryTopic() {
        return TopicBuilder.name(inventoryTopicName).partitions(1).replicas(1).build();
    }
}
