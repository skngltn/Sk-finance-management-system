-- ==============================================================================
-- SK FINANCE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Tables: customers, estimates, estimate_items
-- ==============================================================================

-- 1. Customers & Parties Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_type_flag SMALLINT NOT NULL DEFAULT 1 CHECK (customer_type_flag IN (0, 1)),
    customer_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    organization_name TEXT,
    address TEXT,
    register_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_customer_number ON public.customers (customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_type_flag ON public.customers (customer_type_flag);

-- 2. Estimates Table (No Tax)
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    organization_name TEXT,
    estimate_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Rejected', 'Converted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Estimate Line Items Table (No Tax)
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Permissions & RLS Policies
GRANT ALL ON TABLE public.customers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estimates TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.estimate_items TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all customers" ON public.customers;
CREATE POLICY "Allow public all customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all estimates" ON public.estimates;
CREATE POLICY "Allow public all estimates" ON public.estimates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all estimate_items" ON public.estimate_items;
CREATE POLICY "Allow public all estimate_items" ON public.estimate_items FOR ALL USING (true) WITH CHECK (true);
