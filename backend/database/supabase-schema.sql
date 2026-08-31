-- SQL Schema for SmartShop AI Supabase Tables
-- Paste this script into the Supabase SQL Editor to set up your database.

-- 1. Create SHops table
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    shop_name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    designer_cost INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    total_spending NUMERIC(12,2) DEFAULT 0.00,
    debt_balance NUMERIC(12,2) DEFAULT 0.00,
    last_purchase TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT,
    sku TEXT,
    barcode TEXT,
    purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5,
    expiry_date DATE,
    brand TEXT,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create Sales table
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_profit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'cash',
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Create Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    selling_price NUMERIC(10,2) NOT NULL,
    purchase_price NUMERIC(10,2) NOT NULL,
    profit NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Create Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Create Offers table
CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    offer_type TEXT NOT NULL,
    original_price NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) NOT NULL,
    offer_price NUMERIC(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Create Pamphlets table
CREATE TABLE IF NOT EXISTS pamphlets (
    id TEXT PRIMARY KEY,
    offer_id TEXT REFERENCES offers(id) ON DELETE CASCADE,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    template TEXT NOT NULL,
    language TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Create AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    recommendation TEXT,
    priority TEXT DEFAULT 'medium',
    ref_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 10. Create Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 11. Create Credit Transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE SET NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
    credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    credit_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'due',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 12. Create Credit Payments table
CREATE TABLE IF NOT EXISTS credit_payments (
    id TEXT PRIMARY KEY,
    credit_id TEXT REFERENCES credit_transactions(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'cash',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 13. Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    balance NUMERIC(12,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 14. Create Supplier Transactions table
CREATE TABLE IF NOT EXISTS supplier_transactions (
    id TEXT PRIMARY KEY,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE CASCADE,
    shop_id TEXT REFERENCES shops(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'bill' (goods bought on credit) or 'payment' (paid to supplier)
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    bill_number TEXT,
    payment_method TEXT DEFAULT 'cash',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    due_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 15. Create Cashbook Entries table
CREATE TABLE IF NOT EXISTS cashbook_entries (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'in' (Cash In) or 'out' (Cash Out)
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL, -- 'sale', 'debt_collected', 'supplier_payment', 'expense', 'other'
    payment_mode TEXT DEFAULT 'cash', -- 'cash', 'upi', 'bank'
    notes TEXT,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 16. Create Khata Books table
CREATE TABLE IF NOT EXISTS khata_books (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'store',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
