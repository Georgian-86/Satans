-- Add portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    category VARCHAR(100),
    project_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add packages table
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER DEFAULT 30,
    features TEXT[], -- Array of features
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default packages
INSERT INTO packages (name, description, price, duration_days, features, display_order) VALUES
('Basic', 'Perfect for individuals starting out', 15000.00, 30, ARRAY['5 Design Concepts', 'Basic Revisions', 'Standard Support', '1 Month Access'], 1),
('Pro', 'Best for growing businesses', 35000.00, 90, ARRAY['15 Design Concepts', 'Unlimited Revisions', 'Priority Support', '3 Months Access', 'Source Files Included'], 2),
('Enterprise', 'For large organizations', 75000.00, 365, ARRAY['Unlimited Design Concepts', 'Unlimited Revisions', '24/7 Premium Support', '1 Year Access', 'All Source Files', 'Dedicated Account Manager'], 3)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_active ON portfolio_items(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);

-- Create triggers for updated_at
CREATE TRIGGER update_portfolio_items_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
