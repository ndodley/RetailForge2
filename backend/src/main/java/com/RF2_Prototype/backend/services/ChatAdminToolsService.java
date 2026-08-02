package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.enums.UserRole;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import com.RF2_Prototype.backend.security.AuthenticatedUser;
import com.RF2_Prototype.backend.services.iservices.IChatAdminToolsService;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Admin-only analytics tools for the chat assistant: sales performance,
// inventory levels, and order-status breakdowns across the WHOLE store, not
// just one customer's own data. Every method here re-checks that the caller
// is actually logged in with a MANAGER or EMPLOYEE role before returning
// anything - this is a second, code-level enforcement layer, not just a
// system-prompt instruction, so a regular customer can't get this data just
// by asking cleverly. Kept in its own class/interface (separate from the
// general-audience ChatToolsService) so it's obvious at a glance that
// everything here requires elevated access.
@Component
public class ChatAdminToolsService implements IChatAdminToolsService {

    private static final int TOP_SELLING_LIMIT = 10;
    private static final int LOW_STOCK_THRESHOLD = 5;
    private static final String ACCESS_DENIED_MESSAGE =
            "This requires manager/employee access. Tell the customer this information isn't available to them.";

    private final IProductService productService;
    private final IOrderService orderService;
    private final OrderItemRepository orderItemRepository;

    public ChatAdminToolsService(
            IProductService productService,
            IOrderService orderService,
            OrderItemRepository orderItemRepository
    ) {
        this.productService = productService;
        this.orderService = orderService;
        this.orderItemRepository = orderItemRepository;
    }

    // Role comes only from the server-side session's AuthenticatedUser
    // principal - never from anything the model says.
    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            UserRole role = authenticatedUser.getUser().getRole();
            return role == UserRole.MANAGER || role == UserRole.EMPLOYEE;
        }
        return false;
    }

    @Override
    @Tool(description = "Get the top 10 best-selling products store-wide, ranked by units sold, with revenue per product. " +
            "Access is checked automatically server-side based on who is logged in - always call this for questions " +
            "like what items were ordered the most, or what our best sellers are, regardless of who is asking; it " +
            "will report if the caller is not allowed to see this rather than you needing to decide that yourself.")
    public String getTopSellingProducts() {
        if (!isCurrentUserAdmin()) {
            return ACCESS_DENIED_MESSAGE;
        }

        List<OrderItem> allItems = orderItemRepository.findAll();
        if (allItems.isEmpty()) {
            return "No orders have been placed yet, so there's no sales data.";
        }

        // OrderItem stores a denormalized productName/price snapshot from when
        // the order was placed, so this works without joining back to the live
        // product catalog (and still reports correctly on since-removed products).
        Map<Integer, String> nameByProductId = new LinkedHashMap<>();
        Map<Integer, Integer> quantityByProductId = new LinkedHashMap<>();
        Map<Integer, BigDecimal> revenueByProductId = new LinkedHashMap<>();
        for (OrderItem item : allItems) {
            nameByProductId.putIfAbsent(item.getProductId(), item.getProductName());
            quantityByProductId.merge(item.getProductId(), item.getQuantity(), Integer::sum);
            BigDecimal lineRevenue = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            revenueByProductId.merge(item.getProductId(), lineRevenue, BigDecimal::add);
        }

        List<Map.Entry<Integer, Integer>> ranked = quantityByProductId.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .limit(TOP_SELLING_LIMIT)
                .toList();

        StringBuilder sb = new StringBuilder("Top selling products (by units sold):\n");
        int rank = 1;
        for (Map.Entry<Integer, Integer> entry : ranked) {
            sb.append(rank++).append(". ").append(nameByProductId.get(entry.getKey()))
                    .append(" - ").append(entry.getValue()).append(" sold")
                    .append(", revenue $").append(revenueByProductId.get(entry.getKey()))
                    .append("\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get the current stock level for every product in the catalog. Access is checked " +
            "automatically server-side based on who is logged in - always call this for questions about current " +
            "inventory across the whole store, regardless of who is asking; it will report if the caller is not " +
            "allowed to see this rather than you needing to decide that yourself.")
    public String getCurrentInventory() {
        if (!isCurrentUserAdmin()) {
            return ACCESS_DENIED_MESSAGE;
        }

        List<ProductDto> all = productService.getProducts();
        if (all.isEmpty()) {
            return "The product catalog is currently empty.";
        }

        StringBuilder sb = new StringBuilder("Current inventory (" + all.size() + " products):\n");
        for (ProductDto product : all) {
            sb.append("- ").append(product.name())
                    .append(": ").append(product.stock()).append(" in stock")
                    .append(" (").append(product.departmentName()).append(")\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get every product that is completely out of stock (0 units). Access is checked " +
            "automatically server-side based on who is logged in - always call this for questions about what's out " +
            "of stock store-wide, regardless of who is asking; it will report if the caller is not allowed to see " +
            "this rather than you needing to decide that yourself.")
    public String getOutOfStockProducts() {
        if (!isCurrentUserAdmin()) {
            return ACCESS_DENIED_MESSAGE;
        }

        List<ProductDto> outOfStock = productService.getProducts().stream()
                .filter(p -> p.stock() != null && p.stock() == 0)
                .toList();

        if (outOfStock.isEmpty()) {
            return "Nothing is currently out of stock.";
        }

        StringBuilder sb = new StringBuilder("Out-of-stock products (" + outOfStock.size() + "):\n");
        for (ProductDto product : outOfStock) {
            sb.append("- ").append(product.name()).append(" (").append(product.departmentName()).append(")\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get every product running low on stock (1 to " + LOW_STOCK_THRESHOLD + " units left, " +
            "not counting fully out-of-stock items). Access is checked automatically server-side based on who is " +
            "logged in - always call this for restocking/low-inventory questions regardless of who is asking; it " +
            "will report if the caller is not allowed to see this rather than you needing to decide that yourself.")
    public String getLowStockProducts() {
        if (!isCurrentUserAdmin()) {
            return ACCESS_DENIED_MESSAGE;
        }

        List<ProductDto> lowStock = productService.getProducts().stream()
                .filter(p -> p.stock() != null && p.stock() > 0 && p.stock() <= LOW_STOCK_THRESHOLD)
                .toList();

        if (lowStock.isEmpty()) {
            return "Nothing is currently low on stock (threshold: " + LOW_STOCK_THRESHOLD + " units or fewer).";
        }

        StringBuilder sb = new StringBuilder("Low-stock products, " + LOW_STOCK_THRESHOLD + " units or fewer (" + lowStock.size() + "):\n");
        for (ProductDto product : lowStock) {
            sb.append("- ").append(product.name()).append(": ").append(product.stock()).append(" left\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get a count of all orders store-wide grouped by status (e.g. pending, processing, shipped, delivered). " +
            "Access is checked automatically server-side based on who is logged in - always call this for questions " +
            "about order volume or fulfillment status across all customers, regardless of who is asking; it will " +
            "report if the caller is not allowed to see this rather than you needing to decide that yourself.")
    public String getOrderStatusBreakdown() {
        if (!isCurrentUserAdmin()) {
            return ACCESS_DENIED_MESSAGE;
        }

        List<OrderDto> allOrders = orderService.getAllOrders();
        if (allOrders.isEmpty()) {
            return "No orders have been placed yet.";
        }

        Map<String, Integer> countByStatus = new LinkedHashMap<>();
        for (OrderDto order : allOrders) {
            String status = order.status() == null ? "UNKNOWN" : order.status();
            countByStatus.merge(status, 1, Integer::sum);
        }

        StringBuilder sb = new StringBuilder("Order status breakdown (" + allOrders.size() + " total orders):\n");
        for (Map.Entry<String, Integer> entry : countByStatus.entrySet()) {
            sb.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
        }
        return sb.toString();
    }
}
