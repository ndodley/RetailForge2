-- V6__seed_demo_users.sql
-- Seed demo users for RetailForge authentication

INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    role,
    phone_number,
    address,
    avatar_path
) VALUES
-- Customer demo user
(
    'John',
    'Customer',
    'customer.demo@retailforge.com',
    '$2a$10$t3XNGFvGwpdCHHUR3P0HMuzb0c/3/jvNIl8xJwSlqru71OybJAx8G',
    'CUSTOMER',
    '555-111-2222',
    '123 Customer Lane, Holmdel, NJ',
    'user_images/default_avatar.jpg'
),

-- Manager demo user
(
    'Sarah',
    'Manager',
    'manager.demo@retailforge.com',
    '$2a$10$t3XNGFvGwpdCHHUR3P0HMuzb0c/3/jvNIl8xJwSlqru71OybJAx8G',
    'MANAGER',
    '555-333-4444',
    '45 Corporate Blvd, Newark, NJ',
    'user_images/default_avatar.jpg'
),

-- Employee demo user
(
    'Evan',
    'Employee',
    'employee.demo@retailforge.com',
    '$2a$10$t3XNGFvGwpdCHHUR3P0HMuzb0c/3/jvNIl8xJwSlqru71OybJAx8G',
    'EMPLOYEE',
    '555-555-6666',
    '88 Service Road, Jersey City, NJ',
    'user_images/default_avatar.jpg'
),

-- Admin demo user
(
    'System',
    'Administrator',
    'admin@retailforge.com',
    '$2a$10$t3XNGFvGwpdCHHUR3P0HMuzb0c/3/jvNIl8xJwSlqru71OybJAx8G',
    'MANAGER',
    '555-000-9999',
    'RetailForge HQ, Holmdel, NJ',
    'user_images/default_avatar.jpg'
);
