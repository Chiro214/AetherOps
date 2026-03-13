-- Antigravity CRM (B2C Edition) Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Internal Staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CUSTOMERS (External)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    
    -- AI & Calculated Fields
    lifetime_value NUMERIC(10, 2) DEFAULT 0.00,
    churn_risk_score INTEGER CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
    vip_status BOOLEAN DEFAULT false,
    personality_summary TEXT,
    
    -- Extensibility
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INTERACTIONS (The Timeline)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL CHECK (type IN ('email', 'chat', 'call', 'note', 'ticket')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
    content TEXT NOT NULL,
    
    -- AI Enriched Data
    sentiment_score INTEGER CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
    ai_summary TEXT,
    
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded', 'failed')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TAGS
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#808080'
);

-- CUSTOMER_TAGS (Junction Table)
CREATE TABLE customer_tags (
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (customer_id, tag_id)
);


-- ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

-- Policies (Basic implementation, can be hardened later)
-- Admins can do everything. Agents can view their assigned department's customers (simplified to all for now pending Auth setup).
-- For this setup phase, we'll create permissive policies for authenticated users to ensure rapid frontend development.
-- We will lock this down tighter once the UI is wired up.

CREATE POLICY "Allow authenticated users full access to users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to interactions" ON interactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to transactions" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to customer_tags" ON customer_tags FOR ALL TO authenticated USING (true);

-- Triggers to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
