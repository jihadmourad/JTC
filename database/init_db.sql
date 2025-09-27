-- JTCard Platform Database Schema
-- PostgreSQL and SQLite compatible

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business cards table
CREATE TABLE IF NOT EXISTS business_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) DEFAULT 'My Business Card',
    full_name VARCHAR(255),
    job_title VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    bio TEXT,
    profile_image VARCHAR(255),
    cover_image VARCHAR(255),
    template_id VARCHAR(50) DEFAULT 'modern',
    custom_colors JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Social links table
CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES business_cards(id) ON DELETE CASCADE
);

-- Card analytics table
CREATE TABLE IF NOT EXISTS card_analytics (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'share', 'download'
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES business_cards(id) ON DELETE CASCADE
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    preview_image VARCHAR(255),
    category VARCHAR(50) DEFAULT 'business',
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    css_styles TEXT,
    html_structure TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    features JSON,
    max_cards INTEGER DEFAULT 1,
    max_views INTEGER DEFAULT -1, -- -1 for unlimited
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Insert default templates
INSERT INTO templates (name, slug, description, category, is_premium, css_styles, html_structure) VALUES
('Modern Professional', 'modern', 'Clean and modern design perfect for professionals', 'business', FALSE, '', ''),
('Classic Business', 'classic', 'Traditional business card layout with elegant styling', 'business', FALSE, '', ''),
('Creative Designer', 'creative', 'Bold and creative design for designers and artists', 'creative', TRUE, '', ''),
('Minimal Clean', 'minimal', 'Minimalist design focusing on essential information', 'minimal', FALSE, '', ''),
('Corporate Executive', 'corporate', 'Professional corporate design for executives', 'business', TRUE, '', ''),
('Tech Startup', 'tech', 'Modern tech-focused design with gradients', 'technology', FALSE, '', '');

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, max_cards, max_views) VALUES
('Free', 'free', 'Perfect for getting started', 0.00, 'monthly', '["1 Digital Card", "Basic Templates", "QR Code Sharing", "Basic Analytics"]', 1, 100),
('Pro', 'pro', 'For growing professionals', 9.99, 'monthly', '["5 Digital Cards", "Premium Templates", "Advanced Analytics", "Custom Branding", "Priority Support"]', 5, -1),
('Business', 'business', 'For teams and organizations', 29.99, 'monthly', '["Unlimited Cards", "All Templates", "Team Management", "Advanced Analytics", "API Access", "White Label"]', -1, -1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON business_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_social_links_card_id ON social_links(card_id);
CREATE INDEX IF NOT EXISTS idx_card_analytics_card_id ON card_analytics(card_id);
CREATE INDEX IF NOT EXISTS idx_card_analytics_created_at ON card_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, role) VALUES
('admin', 'admin@jtcard.com', 'scrypt:32768:8:1$YourHashHere$YourHashedPasswordHere', 'super_admin');

-- Create views for analytics
CREATE OR REPLACE VIEW card_stats AS
SELECT 
    bc.id,
    bc.title,
    bc.full_name,
    bc.user_id,
    bc.view_count,
    bc.click_count,
    bc.share_count,
    COUNT(ca.id) as total_events,
    COUNT(CASE WHEN ca.event_type = 'view' THEN 1 END) as analytics_views,
    COUNT(CASE WHEN ca.event_type = 'click' THEN 1 END) as analytics_clicks,
    COUNT(CASE WHEN ca.event_type = 'share' THEN 1 END) as analytics_shares
FROM business_cards bc
LEFT JOIN card_analytics ca ON bc.id = ca.card_id
WHERE bc.is_active = TRUE
GROUP BY bc.id, bc.title, bc.full_name, bc.user_id, bc.view_count, bc.click_count, bc.share_count;

-- Create function to update timestamps (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns (PostgreSQL)
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_cards_updated_at BEFORE UPDATE ON business_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
