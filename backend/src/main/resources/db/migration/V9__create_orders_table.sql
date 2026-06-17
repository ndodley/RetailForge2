CREATE TABLE orders (
                        id SERIAL PRIMARY KEY,

                        user_id INT NOT NULL,
                        address VARCHAR(255) NOT NULL,

                        total DECIMAL(10,2) NOT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'paid',

                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),

                        CONSTRAINT fk_orders_user
                            FOREIGN KEY (user_id) REFERENCES users(id)
                                ON DELETE CASCADE
);
