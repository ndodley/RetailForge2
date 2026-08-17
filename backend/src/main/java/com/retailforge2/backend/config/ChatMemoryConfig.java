package com.retailforge2.backend.config;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.memory.repository.jdbc.PostgresChatMemoryRepositoryDialect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ChatMemoryConfig {

    // Bounds how many prior messages get resent (and billed) on every chat
    // call. A shopping-assistant conversation rarely needs more than this to
    // stay coherent, and it keeps cost from growing unbounded as a
    // conversation gets longer.
    private static final int MAX_MESSAGES = 20;

    @Bean
    public ChatMemory chatMemory(JdbcTemplate jdbcTemplate) {
        JdbcChatMemoryRepository repository = JdbcChatMemoryRepository.builder()
                .jdbcTemplate(jdbcTemplate)
                .dialect(new PostgresChatMemoryRepositoryDialect())
                .build();

        return MessageWindowChatMemory.builder()
                .chatMemoryRepository(repository)
                .maxMessages(MAX_MESSAGES)
                .build();
    }
}
