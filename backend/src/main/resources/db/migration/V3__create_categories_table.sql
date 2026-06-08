-- Categories Table (Each category belongs to a department)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT, -- Added description field
    department_id INT REFERENCES departments(id) ON DELETE CASCADE
);
