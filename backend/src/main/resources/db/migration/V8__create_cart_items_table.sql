-- Cart items table: items belonging to a cart
CREATE TABLE cart_items (
                            id SERIAL PRIMARY KEY,
                            cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
                            product_id INT NOT NULL REFERENCES products(id),
                            quantity INT NOT NULL CHECK (quantity > 0),
                            price_at_time DECIMAL(10,2) NOT NULL,
                            created_at TIMESTAMP DEFAULT NOW(),
                            updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_cart_items_cart_product
    ON cart_items(cart_id, product_id);
