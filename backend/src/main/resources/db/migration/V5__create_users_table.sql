-- V5__create_users_table.sql
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(32) NOT NULL,
                       phone_number VARCHAR(50),
                       address TEXT,
                       avatar_path TEXT, -- NEW COLUMN FOR USER PROFILE IMAGES
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER', 'MANAGER', 'EMPLOYEE'))
);

CREATE INDEX idx_users_email ON users(email);
