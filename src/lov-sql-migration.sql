
-- Create expenses table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    expense_type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    vendor_id TEXT,
    document_id UUID,
    budget_item_id UUID,
    time_entry_id UUID,
    parent_expense_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by TEXT,
    status TEXT DEFAULT 'ACTIVE',
    is_billable BOOLEAN DEFAULT true,
    is_receipt BOOLEAN DEFAULT false,
    notes TEXT
);

-- Create estimate_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id TEXT NOT NULL REFERENCES estimates(estimateid),
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    cost NUMERIC,
    markup_percentage NUMERIC DEFAULT 0,
    markup_amount NUMERIC,
    gross_margin NUMERIC,
    gross_margin_percentage NUMERIC,
    vendor_id TEXT,
    subcontractor_id TEXT,
    item_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES projects(projectid),
    budget_item_id UUID REFERENCES project_budget_items(id),
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    amount NUMERIC NOT NULL,
    vendor_id TEXT,
    description TEXT NOT NULL,
    document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_order_time_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.work_order_time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES maintenance_work_orders(work_order_id),
    employee_id UUID,
    hours_worked NUMERIC NOT NULL,
    work_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcontractor_invoices_new table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subcontractor_invoices_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcontractor_id TEXT NOT NULL REFERENCES subcontractors(subid),
    project_id TEXT REFERENCES projects(projectid),
    invoice_number TEXT,
    amount NUMERIC NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'PENDING',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_entries_migration_view if it doesn't exist
CREATE OR REPLACE VIEW time_entries_migration_view AS
SELECT * FROM time_entries;
