package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.ProductAvailabilityDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.services.iservices.IChatToolsService;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

// Gives the chat assistant real, read-only access to the product catalog so it
// can answer stock/price/availability questions instead of guessing. Spring AI
// invokes this automatically mid-conversation whenever it decides a question
// needs catalog data - nothing else in the app calls it directly.
@Component
public class ChatToolsService implements IChatToolsService {

    // Keeps a single tool call's response (and therefore token cost) bounded
    // even if the catalog grows large or a keyword matches broadly.
    private static final int MAX_RESULTS = 20;

    private final IProductService productService;

    public ChatToolsService(IProductService productService) {
        this.productService = productService;
    }

    @Override
    @Tool(description = "Search the store's product catalog for real-time name, brand, price, stock quantity, and department. " +
            "Use this whenever a customer asks what's in stock, what something costs, or whether a product/brand/category is available.")
    public List<ProductAvailabilityDto> searchProducts(
            @ToolParam(description = "Keyword to match against product name, brand, or department (e.g. 'PS5', 'Nike', 'shoes'). Leave blank to list products generally.", required = false)
            String keyword) {

        List<ProductDto> all = productService.getProducts();
        String needle = keyword == null ? "" : keyword.trim().toLowerCase();

        if (needle.isEmpty()) {
            return summarize(all);
        }

        List<ProductDto> filtered = all.stream()
                .filter(p -> matches(p, needle))
                .toList();

        // The model's chosen keyword is a paraphrase (e.g. "game systems") and
        // may not literally appear anywhere in the catalog's text fields (which
        // say "Game Consoles"). Rather than hand back an empty list - which the
        // model tends to misread as "nothing in stock" - fall back to the full
        // catalog so it can still reason over real data instead of guessing.
        return summarize(filtered.isEmpty() ? all : filtered);
    }

    private List<ProductAvailabilityDto> summarize(List<ProductDto> products) {
        return products.stream()
                .limit(MAX_RESULTS)
                .map(p -> new ProductAvailabilityDto(p.name(), p.brand(), p.price(), p.stock(), p.departmentName()))
                .toList();
    }

    private boolean matches(ProductDto p, String needle) {
        // Token-based OR match: "game systems" should still match a category of
        // "Game Consoles" even though neither word-for-word phrase contains the
        // other. A plain needle.contains(field) check only catches exact phrase
        // matches, which real user/model phrasing rarely lines up with.
        for (String token : needle.split("\\s+")) {
            if (token.length() < 3) {
                continue;
            }
            if (contains(p.name(), token) || contains(p.brand(), token)
                    || contains(p.departmentName(), token) || contains(p.categoryName(), token)) {
                return true;
            }
        }
        return false;
    }

    private boolean contains(String field, String token) {
        return field != null && field.toLowerCase().contains(token);
    }
}
