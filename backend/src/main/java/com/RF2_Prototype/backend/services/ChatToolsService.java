package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.CartDto;
import com.RF2_Prototype.backend.models.dtos.CartItemDto;
import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.models.dtos.ProductAvailabilityDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.dtos.ReviewDto;
import com.RF2_Prototype.backend.models.entities.OrderItem;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.OrderItemRepository;
import com.RF2_Prototype.backend.security.AuthenticatedUser;
import com.RF2_Prototype.backend.services.iservices.ICartService;
import com.RF2_Prototype.backend.services.iservices.IChatToolsService;
import com.RF2_Prototype.backend.services.iservices.IFavoriteService;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import com.RF2_Prototype.backend.services.iservices.IReviewService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

// Gives the chat assistant real, read-only access to the product catalog,
// reviews, and store-wide popularity, plus - for whoever is currently logged
// in - the ability to read and change their own cart/orders/favorites. Spring
// AI invokes these automatically mid-conversation whenever it decides a
// question or request needs them - nothing else in the app calls them
// directly. Admin-only analytics (top sellers by revenue, inventory reports,
// order status breakdowns) live in ChatAdminToolsService instead, gated to
// MANAGER/EMPLOYEE roles - everything in this class is safe for any visitor,
// logged in or not.
@Component
public class ChatToolsService implements IChatToolsService {

    // Keeps a single tool call's response (and therefore token cost) bounded
    // even if the catalog grows large or a keyword matches broadly.
    private static final int MAX_RESULTS = 20;
    private static final int POPULAR_PRODUCTS_LIMIT = 10;

    private final IProductService productService;
    private final ICartService cartService;
    private final IOrderService orderService;
    private final IFavoriteService favoriteService;
    private final IReviewService reviewService;
    private final OrderItemRepository orderItemRepository;

    public ChatToolsService(
            IProductService productService,
            ICartService cartService,
            IOrderService orderService,
            IFavoriteService favoriteService,
            IReviewService reviewService,
            OrderItemRepository orderItemRepository
    ) {
        this.productService = productService;
        this.cartService = cartService;
        this.orderService = orderService;
        this.favoriteService = favoriteService;
        this.reviewService = reviewService;
        this.orderItemRepository = orderItemRepository;
    }

    // Resolves who's actually logged in from the server-side session -
    // never from anything the model says. Same principal type
    // (AuthenticatedUser wrapping the real User entity) that CartService and
    // every other authenticated-only service already relies on.
    private Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            return Optional.of(authenticatedUser.getUser());
        }
        return Optional.empty();
    }

    @Override
    @Tool(description = "Search the store's product catalog for real-time name, brand, price, stock quantity, department, and " +
            "average rating. Use this whenever a customer asks what's in stock, what something costs, whether a product/brand/" +
            "category is available, or how a product is rated.")
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

    @Override
    @Tool(description = "Get the currently logged-in customer's shopping cart contents - each item's name, price, quantity, and the cart subtotal. " +
            "Only usable when a customer is actually logged in; if nobody is logged in, this says so instead of guessing.")
    public String getMyCart() {
        if (getCurrentUser().isEmpty()) {
            return "No customer is currently logged in, so there is no cart to look up. Tell them to log in first.";
        }

        CartDto cart = cartService.getCartForCurrentUser();
        List<CartItemDto> items = cart.items();
        if (items == null || items.isEmpty()) {
            return "The customer's cart is currently empty.";
        }

        StringBuilder sb = new StringBuilder("Cart contents (" + cart.totalItems() + " items):\n");
        for (CartItemDto item : items) {
            sb.append("- ").append(item.productName())
                    .append(" x").append(item.quantity())
                    .append(" @ $").append(item.priceAtTime())
                    .append(" each\n");
        }
        sb.append("Subtotal: $").append(cart.subtotal());
        return sb.toString();
    }

    @Override
    @Tool(description = "Get the currently logged-in customer's order history - each order's id, status, total, and placement date, " +
            "plus the total order count, total amount spent, and which single order they spent the most on. " +
            "Use this for questions about order status, how many orders they've placed, or which order cost the most. " +
            "Only usable when a customer is actually logged in; if nobody is logged in, this says so instead of guessing.")
    public String getMyOrders() {
        Optional<User> user = getCurrentUser();
        if (user.isEmpty()) {
            return "No customer is currently logged in, so there is no order history to look up. Tell them to log in first.";
        }

        List<OrderDto> orders = orderService.getOrdersByUserId(user.get().getId());
        if (orders.isEmpty()) {
            return "The customer has not placed any orders yet.";
        }

        // Pre-computed here (count, total spent, highest-spend order) rather
        // than left for the model to derive from the raw list, so simple
        // arithmetic/comparison questions can't be answered wrong.
        BigDecimal totalSpent = orders.stream()
                .map(OrderDto::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        OrderDto highestSpendOrder = orders.stream()
                .max(Comparator.comparing(OrderDto::total))
                .orElse(null);

        StringBuilder sb = new StringBuilder();
        sb.append("Total orders placed: ").append(orders.size()).append("\n");
        sb.append("Total spent across all orders: $").append(totalSpent).append("\n");
        if (highestSpendOrder != null) {
            sb.append("Highest-spend order: #").append(highestSpendOrder.id())
                    .append(" ($").append(highestSpendOrder.total()).append(")\n");
        }
        sb.append("\nFull order list:\n");
        for (OrderDto order : orders) {
            sb.append("- Order #").append(order.id())
                    .append(": status=").append(order.status())
                    .append(", total=$").append(order.total())
                    .append(", placed=").append(order.createdAt())
                    .append("\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get the products the currently logged-in customer has marked as favorites. " +
            "Only usable when a customer is actually logged in; if nobody is logged in, this says so instead of guessing.")
    public String getMyFavorites() {
        Optional<User> user = getCurrentUser();
        if (user.isEmpty()) {
            return "No customer is currently logged in, so there are no favorites to look up. Tell them to log in first.";
        }

        List<ProductDto> favorites = favoriteService.getFavoriteProductsByUserId(user.get().getId());
        if (favorites.isEmpty()) {
            return "The customer has no favorited products.";
        }

        StringBuilder sb = new StringBuilder("Favorited products (" + favorites.size() + "):\n");
        for (ProductDto product : favorites) {
            sb.append("- ").append(product.name())
                    .append(" - $").append(product.price())
                    .append(" (stock: ").append(product.stock()).append(")\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Add a product to the currently logged-in customer's cart. If the product is already in the cart, " +
            "this does NOT add a duplicate or silently increase the quantity - it reports the current quantity instead so " +
            "the assistant can ask the customer whether they'd like to increase it (then call updateCartQuantity if they say yes). " +
            "Only usable when a customer is actually logged in.")
    public String addToCart(
            @ToolParam(description = "Exact product name to add. Use searchProducts first if you're not sure of the exact name.")
            String productName,
            @ToolParam(description = "Quantity to add for a brand-new cart item. Defaults to 1 if not specified.", required = false)
            Integer quantity) {

        if (getCurrentUser().isEmpty()) {
            return "No customer is currently logged in, so nothing can be added to a cart. Tell them to log in first.";
        }

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        CartDto cart = cartService.getCartForCurrentUser();
        Optional<CartItemDto> existing = cart.items() == null ? Optional.empty()
                : cart.items().stream().filter(i -> i.productId().equals(product.id())).findFirst();

        if (existing.isPresent()) {
            return "The customer already has " + product.name() + " in their cart (currently qty " + existing.get().quantity() + "). "
                    + "Ask them whether they'd like to increase the quantity instead of adding a duplicate - if they confirm, "
                    + "call updateCartQuantity with the new total quantity they want.";
        }

        int qty = (quantity == null || quantity <= 0) ? 1 : quantity;
        CartDto updated = cartService.addItem(product.id(), qty);
        return "Added " + qty + " x " + product.name() + " to the cart. New subtotal: $" + updated.subtotal() + ".";
    }

    @Override
    @Tool(description = "Set the exact quantity of a product already in the customer's cart - use this only after the customer " +
            "has confirmed they want to change the quantity (e.g. after addToCart reported the item was already present). " +
            "This sets the total quantity, it does not add to the existing amount. Setting quantity to 0 removes the item. " +
            "Only usable when a customer is actually logged in.")
    public String updateCartQuantity(
            @ToolParam(description = "Exact product name already in the cart.")
            String productName,
            @ToolParam(description = "The new total quantity for this item (not an increment). 0 removes it.")
            int quantity) {

        if (getCurrentUser().isEmpty()) {
            return "No customer is currently logged in, so there is no cart to update. Tell them to log in first.";
        }

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        CartDto cart = cartService.getCartForCurrentUser();
        boolean inCart = cart.items() != null && cart.items().stream().anyMatch(i -> i.productId().equals(product.id()));
        if (!inCart) {
            return product.name() + " is not currently in the cart, so there's nothing to update. Use addToCart instead.";
        }

        CartDto updated = cartService.updateQuantity(product.id(), quantity);
        if (quantity <= 0) {
            return "Removed " + product.name() + " from the cart.";
        }
        return "Updated " + product.name() + " to quantity " + quantity + ". New subtotal: $" + updated.subtotal() + ".";
    }

    @Override
    @Tool(description = "Remove a product entirely from the currently logged-in customer's cart. " +
            "Only usable when a customer is actually logged in.")
    public String removeFromCart(
            @ToolParam(description = "Exact product name to remove.")
            String productName) {

        if (getCurrentUser().isEmpty()) {
            return "No customer is currently logged in, so there is no cart to update. Tell them to log in first.";
        }

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        CartDto cart = cartService.getCartForCurrentUser();
        boolean inCart = cart.items() != null && cart.items().stream().anyMatch(i -> i.productId().equals(product.id()));
        if (!inCart) {
            return product.name() + " is not currently in the cart.";
        }

        cartService.removeItem(product.id());
        return "Removed " + product.name() + " from the cart.";
    }

    @Override
    @Tool(description = "Mark a product as a favorite for the currently logged-in customer. " +
            "Only usable when a customer is actually logged in.")
    public String addFavorite(
            @ToolParam(description = "Exact product name to favorite. Use searchProducts first if you're not sure of the exact name.")
            String productName) {

        Optional<User> user = getCurrentUser();
        if (user.isEmpty()) {
            return "No customer is currently logged in, so nothing can be favorited. Tell them to log in first.";
        }

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        if (favoriteService.isFavorite(user.get().getId(), product.id())) {
            return product.name() + " is already marked as a favorite.";
        }

        favoriteService.addFavorite(user.get().getId(), product.id());
        return "Added " + product.name() + " to favorites.";
    }

    @Override
    @Tool(description = "Remove a product from the currently logged-in customer's favorites. " +
            "Only usable when a customer is actually logged in.")
    public String removeFavorite(
            @ToolParam(description = "Exact product name to un-favorite.")
            String productName) {

        Optional<User> user = getCurrentUser();
        if (user.isEmpty()) {
            return "No customer is currently logged in, so there are no favorites to update. Tell them to log in first.";
        }

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        if (!favoriteService.isFavorite(user.get().getId(), product.id())) {
            return product.name() + " is not currently marked as a favorite.";
        }

        favoriteService.removeFavorite(user.get().getId(), product.id());
        return "Removed " + product.name() + " from favorites.";
    }

    @Override
    @Tool(description = "Get the store's most popular products by units sold across all orders (top 10). " +
            "Use this for general questions about what's popular, trending, or best-selling. " +
            "Available to any visitor, logged in or not.")
    public String getPopularProducts() {
        List<OrderItem> allItems = orderItemRepository.findAll();
        if (allItems.isEmpty()) {
            return "No orders have been placed yet, so there's no sales data to rank popularity by.";
        }

        // OrderItem stores a denormalized productName snapshot from when the
        // order was placed, so popularity ranking works here without needing
        // to join back to the live product catalog.
        Map<Integer, String> nameByProductId = new LinkedHashMap<>();
        Map<Integer, Integer> quantityByProductId = new LinkedHashMap<>();
        for (OrderItem item : allItems) {
            nameByProductId.putIfAbsent(item.getProductId(), item.getProductName());
            quantityByProductId.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }

        List<Map.Entry<Integer, Integer>> ranked = quantityByProductId.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .limit(POPULAR_PRODUCTS_LIMIT)
                .toList();

        StringBuilder sb = new StringBuilder("Most popular products by units sold:\n");
        int rank = 1;
        for (Map.Entry<Integer, Integer> entry : ranked) {
            sb.append(rank++).append(". ").append(nameByProductId.get(entry.getKey()))
                    .append(" - ").append(entry.getValue()).append(" sold\n");
        }
        return sb.toString();
    }

    @Override
    @Tool(description = "Get the written reviews (rating, comment, reviewer name) for one specific product, plus its average rating. " +
            "Use this when someone asks what reviews a product has, not just its overall rating. Available to any visitor, logged in or not.")
    public String getProductReviews(
            @ToolParam(description = "Exact product name to look up reviews for. Use searchProducts first if you're not sure of the exact name.")
            String productName) {

        List<ProductDto> matches = findProductsByName(productName);
        if (matches.size() != 1) {
            return describeMatchProblem(productName, matches);
        }
        ProductDto product = matches.get(0);

        List<ReviewDto> reviews = reviewService.getReviewsByProductId(product.id());
        if (reviews.isEmpty()) {
            return product.name() + " has no written reviews yet. Its current average rating is " + product.rating() + ".";
        }

        StringBuilder sb = new StringBuilder(product.name() + " has " + reviews.size()
                + " review(s), average rating " + product.rating() + ":\n");
        for (ReviewDto review : reviews) {
            sb.append("- ").append(review.rating()).append("/5");
            if (review.userFullName() != null && !review.userFullName().isBlank()) {
                sb.append(" by ").append(review.userFullName());
            }
            if (review.comment() != null && !review.comment().isBlank()) {
                sb.append(": \"").append(review.comment()).append("\"");
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    private List<ProductAvailabilityDto> summarize(List<ProductDto> products) {
        return products.stream()
                .limit(MAX_RESULTS)
                .map(p -> new ProductAvailabilityDto(p.name(), p.brand(), p.price(), p.stock(), p.departmentName(), p.rating()))
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

    // Deliberately stricter than searchProducts' loose matching: an action
    // that resolves to one specific product (mutation or review lookup) must
    // act on exactly one product, never a guess. Tries an exact name match
    // first (the common case, since the model usually echoes back a name it
    // already saw from searchProducts), then falls back to a substring match -
    // but never falls back to the whole catalog the way searchProducts does,
    // since that's fine for browsing but not for deciding what to act on.
    private List<ProductDto> findProductsByName(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        String needle = keyword.trim().toLowerCase();
        List<ProductDto> all = productService.getProducts();

        List<ProductDto> exact = all.stream()
                .filter(p -> p.name() != null && p.name().trim().equalsIgnoreCase(needle))
                .toList();
        if (!exact.isEmpty()) {
            return exact;
        }

        return all.stream()
                .filter(p -> p.name() != null && p.name().toLowerCase().contains(needle))
                .toList();
    }

    private String describeMatchProblem(String keyword, List<ProductDto> matches) {
        if (matches.isEmpty()) {
            return "No product found matching \"" + keyword + "\". Use searchProducts to find the exact name first, then try again.";
        }
        String names = matches.stream().map(ProductDto::name).collect(Collectors.joining(", "));
        return "Multiple products match \"" + keyword + "\": " + names + ". Ask the customer which exact one they mean before making any change.";
    }
}
