package com.retailforge2.backend.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import java.util.HashMap;
import java.util.Map;

// Defines the producer (KafkaTemplate) and consumer (listener container
// factory) plumbing explicitly, rather than relying on Spring Boot to
// autoconfigure it from the spring.kafka.* properties. That autoconfiguration
// turned out not to produce a usable KafkaTemplate<Object, Object> bean on
// this Spring Boot / Spring for Apache Kafka version (see the step 8
// verification pass) - defining it ourselves removes the guesswork.
//
// Uses JacksonJsonSerializer/JacksonJsonDeserializer (Jackson 3), not the
// older JsonSerializer/JsonDeserializer - those were deprecated for removal
// in Spring for Apache Kafka 4.0 in favor of these, matching Spring Boot
// 4.1's own move to Jackson 3.
//
// Deliberately NOT gated behind @ConditionalOnProperty("kafka.enabled") like
// KafkaConfig is: KafkaEventPublisher is itself unconditional (always safe to
// call, checks the flag per-method), so its KafkaTemplate dependency must
// always be constructible too, even when Kafka is turned off. None of this
// actually connects to a broker until something is sent or a listener starts
// polling - building a ProducerFactory/ConsumerFactory is cheap and lazy.
@Configuration
@EnableKafka
public class KafkaClientConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.client-id}")
    private String clientId;

    @Value("${spring.kafka.consumer.group-id}")
    private String consumerGroupId;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.CLIENT_ID_CONFIG, clientId);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JacksonJsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JacksonJsonDeserializer.class);
        configProps.put(JacksonJsonDeserializer.TRUSTED_PACKAGES, "com.retailforge2.backend.events");
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    // Bean name matters here: @KafkaListener (used in KafkaEventListener)
    // looks up a bean named exactly "kafkaListenerContainerFactory" by
    // default when its containerFactory attribute isn't set.
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
            ConsumerFactory<String, Object> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        return factory;
    }
}
