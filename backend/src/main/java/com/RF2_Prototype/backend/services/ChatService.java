package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.AiProviderException;
import com.RF2_Prototype.backend.services.iservices.IChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ChatService implements IChatService {

    private final ChatClient chatClient;

    // The active provider (Anthropic vs OpenAI) is selected via
    // spring.ai.model.chat in application.properties, so this plain
    // ChatClient.Builder injection resolves without ambiguity.
    public ChatService(ChatClient.Builder chatClientBuilder, ChatProductTools productTools) {
        this.chatClient = chatClientBuilder
                .defaultSystem("""
                        You are a helpful shopping assistant for this store.
                        Answer concisely and only about products, orders, and the storefront.
                        Use the searchProducts tool to check real stock, price, and availability
                        before answering questions about what's in stock or what something costs -
                        never guess or make up inventory information.

                        Formatting: replies render as Markdown in a narrow ~340px chat panel, so
                        favor short bullet lists over tables for a handful of items. Only use a
                        Markdown table when the user explicitly asks for one, or when comparing
                        several items across several attributes makes a list hard to read.
                        """)
                .defaultTools(productTools)
                .build();
    }

    @Override
    public String getReply(String message) {
        try {
            return chatClient.prompt()
                    .user(message)
                    .call()
                    .content();
        } catch (Exception e) {
            // Logged at ERROR with the full cause so the real reason (bad key,
            // no billing, invalid model id, network issue, etc.) is visible in
            // the console - the exception shown to the frontend is intentionally
            // generic so provider-specific error details never leak to users.
            log.error("Chat provider request failed", e);
            throw new AiProviderException("The assistant is temporarily unavailable. Please try again.", e);
        }
    }
}
