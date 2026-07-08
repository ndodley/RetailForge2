/*-- This SQL script creates the 'reviews' table in the database.
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,  -- Foreign key to the products table
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,  -- Foreign key to the users table
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),  -- Rating must be between 0 and 5
    comment TEXT,                                               -- Optional comment for the review
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,              -- Timestamp of when the review was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Timestamp of when the review was last updated
);*/

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reviews_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that fires before UPDATE
CREATE TRIGGER trg_update_reviews_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_timestamp();
