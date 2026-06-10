-- Carts table: one cart per user
CREATE TABLE carts (
                       id SERIAL PRIMARY KEY,
                       user_id INT NOT NULL REFERENCES users(id),
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_carts_user_id ON carts(user_id);
