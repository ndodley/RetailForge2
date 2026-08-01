package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.AiProviderException;
import com.RF2_Prototype.backend.services.iservices.IChatAdminToolsService;
import com.RF2_Prototype.backend.services.iservices.IChatToolsService;
import com.RF2_Prototype.backend.services.iservices.IChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ChatService implements IChatService {

    private final ChatClient chatClient;

    // The active provider (Anthropic vs OpenAI) is selected via
    // spring.ai.model.chat in application.properties, so this plain
    // ChatClient.Builder injection resolves without ambiguity.
    public ChatService(
            ChatClient.Builder chatClientBuilder,
            IChatToolsService chatToolsService,
            IChatAdminToolsService chatAdminToolsService,
            ChatMemory chatMemory
    ) {
        this.chatClient = chatClientBuilder
                .defaultSystem("""
                        You are a helpful shopping assistant for this store.
                        Answer concisely and only about products, orders, the storefront, and
                        (when someone is logged in) their own cart, orders, and favorites.

                        Use the searchProducts tool to check real stock, price, availability, and
                        rating before answering questions about what's in stock, what something
                        costs, or how it's rated - never guess or make up inventory information.
                        Use getProductReviews when someone wants to know what reviews a specific
                        product has, not just its overall rating. Use getPopularProducts for general
                        "what's popular/trending/best-selling" questions - these three tools work for
                        any visitor, logged in or not.

                        Use the getMyCart, getMyOrders, and getMyFavorites tools for questions about
                        "my cart", "my order(s)", order status, how many orders someone has placed,
                        which order they spent the most on, or their favorited products. These tools
                        already know who is logged in - never ask the customer for their user ID or
                        email to look this up. If one of these tools reports that nobody is logged
                        in, tell the customer they need to log in to see that information - never
                        guess or make up account data.

                        Use addToCart, updateCartQuantity, and removeFromCart to change what's in the
                        cart, and addFavorite/removeFavorite to change favorites. If you're not sure
                        of a product's exact name, call searchProducts first rather than guessing it.
                        If addToCart reports the product is already in the cart, do NOT call it again
                        or assume they want more - tell the customer it's already there with its
                        current quantity and ask whether they'd like to increase it; only call
                        updateCartQuantity once they confirm a new quantity. If a tool reports a
                        product name matched more than one item, ask the customer to clarify which
                        exact one they mean instead of picking one yourself.

                        Use getTopSellingProducts, getCurrentInventory, getOutOfStockProducts,
                        getLowStockProducts, and getOrderStatusBreakdown for store-wide admin/manager
                        questions (best sellers, full inventory, what's out of stock or low, order
                        volume by status). You have no way of knowing whether the current user is a
                        manager/employee or a regular customer, so never refuse or guess up front -
                        always call the relevant tool first and let it decide. If it reports the
                        information isn't available, tell the customer this data isn't accessible to
                        them; otherwise relay exactly what it returns.

                        Formatting: replies render as Markdown in a narrow ~340px chat panel, so
                        favor short bullet lists over tables for a handful of items. Only use a
                        Markdown table when the user explicitly asks for one, or when comparing
                        several items across several attributes makes a list hard to read.
                        """)
                .defaultTools(chatToolsService, chatAdminToolsService)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    @Override
    public String getReply(String message, String conversationId) {
        try {
            return chatClient.prompt()
                    .user(message)
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
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
