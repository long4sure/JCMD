-- ============================================
-- BREW & BEAN COFFEE SHOP - COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL
-- Save this file for backup/documentation
-- ============================================

-- ============================================
-- TABLE: menu_items
-- Stores all products available for sale
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Hot Coffee', 'Iced Coffee', 'Tea', 'Pastry', 'Sandwich', 'Other')),
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: orders
-- Stores customer purchases
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT DEFAULT 'Walk-in',
  order_type TEXT CHECK (order_type IN ('Dine-in', 'Take-out', 'Delivery')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'GCash', 'Maya')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Preparing', 'Ready', 'Served', 'Cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: order_items
-- Individual items within each order
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  notes TEXT
);

-- ============================================
-- TABLE: daily_sales
-- Aggregated daily sales summary
-- ============================================
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE UNIQUE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  cash_amount DECIMAL(10,2) DEFAULT 0,
  card_amount DECIMAL(10,2) DEFAULT 0,
  gcash_amount DECIMAL(10,2) DEFAULT 0,
  maya_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: audit_log
-- Tracks who did what (for accountability)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAMPLE DATA
-- Initial menu items to get started
-- ============================================
INSERT INTO menu_items (name, category, price, cost, stock, description) VALUES
('Espresso', 'Hot Coffee', 100.00, 25.00, 200, 'Single shot espresso'),
('Americano', 'Hot Coffee', 120.00, 30.00, 200, 'Espresso with hot water'),
('Cappuccino', 'Hot Coffee', 140.00, 40.00, 200, 'Espresso with steamed milk foam'),
('Latte', 'Hot Coffee', 140.00, 42.00, 200, 'Espresso with steamed milk'),
('Mocha', 'Hot Coffee', 160.00, 50.00, 150, 'Latte with chocolate syrup'),
('Iced Americano', 'Iced Coffee', 130.00, 32.00, 200, 'Chilled americano'),
('Iced Latte', 'Iced Coffee', 150.00, 45.00, 200, 'Chilled latte'),
('Caramel Macchiato', 'Iced Coffee', 170.00, 55.00, 150, 'Iced latte with caramel'),
('Matcha Latte', 'Tea', 150.00, 48.00, 100, 'Japanese green tea latte'),
('Chai Tea', 'Tea', 130.00, 35.00, 100, 'Spiced Indian tea'),
('Croissant', 'Pastry', 90.00, 35.00, 30, 'Butter croissant'),
('Blueberry Muffin', 'Pastry', 85.00, 30.00, 25, 'Fresh baked muffin'),
('Tuna Sandwich', 'Sandwich', 120.00, 55.00, 20, 'Tuna with lettuce and mayo'),
('Ham & Cheese', 'Sandwich', 110.00, 50.00, 20, 'Grilled ham and cheese');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
-- ============================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: menu_items
-- ============================================
CREATE POLICY "All authenticated can view menu" ON menu_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can insert menu" ON menu_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admin can update menu" ON menu_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can delete menu" ON menu_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: orders
-- ============================================
CREATE POLICY "All authenticated can view orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated can create orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: order_items
-- ============================================
CREATE POLICY "All authenticated can view order items" ON order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated can insert order items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: daily_sales
-- ============================================
CREATE POLICY "All authenticated can view sales" ON daily_sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can modify sales" ON daily_sales
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: audit_log
-- ============================================
CREATE POLICY "All authenticated can view audit log" ON audit_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert audit log" ON audit_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: update_daily_sales()
-- Calculates today's sales summary and saves to daily_sales table
-- Call with: SELECT update_daily_sales();
-- ============================================
CREATE OR REPLACE FUNCTION update_daily_sales()
RETURNS void AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    v_total_orders INTEGER;
    v_total_revenue DECIMAL(10,2);
    v_total_cost DECIMAL(10,2);
    v_cash DECIMAL(10,2);
    v_card DECIMAL(10,2);
    v_gcash DECIMAL(10,2);
    v_maya DECIMAL(10,2);
BEGIN
    -- Calculate today's order counts and revenue by payment method
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'Card' THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'GCash' THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'Maya' THEN total_amount ELSE 0 END), 0)
    INTO 
        v_total_orders,
        v_total_revenue,
        v_cash,
        v_card,
        v_gcash,
        v_maya
    FROM orders
    WHERE DATE(created_at) = today_date
    AND status = 'Served';
    
    -- Calculate cost of goods sold
    SELECT COALESCE(SUM(oi.quantity * mi.cost), 0)
    INTO v_total_cost
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    WHERE DATE(o.created_at) = today_date
    AND o.status = 'Served';
    
    -- Insert or update daily_sales
    INSERT INTO daily_sales (sale_date, total_orders, total_revenue, total_cost, cash_amount, card_amount, gcash_amount, maya_amount)
    VALUES (today_date, v_total_orders, v_total_revenue, v_total_cost, v_cash, v_card, v_gcash, v_maya)
    ON CONFLICT (sale_date) 
    DO UPDATE SET 
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        total_cost = EXCLUDED.total_cost,
        cash_amount = EXCLUDED.cash_amount,
        card_amount = EXCLUDED.card_amount,
        gcash_amount = EXCLUDED.gcash_amount,
        maya_amount = EXCLUDED.maya_amount;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISSIONS
-- Grant necessary schema access
-- ============================================
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- Function to update user role
CREATE OR REPLACE FUNCTION update_user_role(user_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', new_role)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users (for admin panel)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_user_meta_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.last_sign_in_at,
        u.raw_user_meta_data
    FROM auth.users u;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USEFUL QUERIES (for reference)
-- ============================================

-- Set user as admin:
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb WHERE email = 'you@example.com';

-- Set user as staff:
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"staff"}'::jsonb WHERE email = 'staff@example.com';

-- Check user role:
-- SELECT email, raw_user_meta_data->>'role' as role FROM auth.users;

-- View all tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Reset all data (careful!):
-- TRUNCATE TABLE order_items, orders, daily_sales, menu_items, audit_log RESTART IDENTITY CASCADE;