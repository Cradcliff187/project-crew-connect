# Supabase Database Optimization Plan

## Current Schema Analysis

Based on our schema discovery, we've identified two tables with the following structure:

### `customers` Table
- Primary identifier: `customerid` (string format: "CUS-XXXXXX")
- Contains business information, contact details, and status flags
- Includes audit fields like `created_at`, `updated_at`, `createdby`

### `employees` Table
- Primary identifier: `employee_id` (UUID format)
- Contains employee personal information, role, rate, and status
- Includes audit fields like `created_at`, `updated_at`

## Optimization Recommendations

### 1. Schema Structure Improvements

#### Primary Keys and IDs
- **Issue**: Inconsistent ID formats between tables (`customerid` is string, `employee_id` is UUID)
- **Recommendation**: Standardize on UUID format for all primary keys for better performance and consistency
- **SQL**:
```sql
-- Modify customers table to use UUID
ALTER TABLE customers 
  ADD COLUMN id UUID DEFAULT uuid_generate_v4() NOT NULL;

-- Create migration function to copy data
-- Then drop the old customerid column or keep as display_id
```

#### Data Type Corrections
- **Issue**: Some columns have incorrect data types (e.g., `zip` detected as date type)
- **Recommendation**: Update data types for accuracy
- **SQL**:
```sql
-- Fix zip code data type
ALTER TABLE customers
  ALTER COLUMN zip TYPE varchar(10);

-- Other type corrections as needed
```

#### Normalization
- **Issue**: Address information is embedded in the customers table
- **Recommendation**: Create a separate addresses table to:
  - Allow multiple addresses per customer
  - Improve data quality and reduce duplication
- **SQL**:
```sql
-- Create addresses table
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  address_type VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Performance Optimizations

#### Indexing Strategy
- **Issue**: Likely missing indexes on frequently queried fields
- **Recommendation**: Add appropriate indexes
- **SQL**:
```sql
-- Customers table indexes
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_city_state ON customers(city, state);
CREATE INDEX idx_customers_email ON customers(contactemail);

-- Employees table indexes
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
```

#### Query Performance
- **Issue**: Potential for inefficient queries
- **Recommendation**: Add composite indexes for common query patterns
- **SQL**:
```sql
-- Composite index example for common query patterns
CREATE INDEX idx_employees_role_status ON employees(role, status);
```

### 3. Security Enhancements

#### Row Level Security (RLS)
- **Issue**: Lack of row-level security policies
- **Recommendation**: Implement RLS to control access to records
- **SQL**:
```sql
-- Enable RLS on tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY customers_view_policy ON customers
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_permissions WHERE resource = 'customers' AND permission = 'view'
  ));
```

#### Audit Trails
- **Issue**: Basic audit fields exist but limited tracking
- **Recommendation**: Enhance audit capabilities
- **SQL**:
```sql
-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs(table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs(table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs(table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 4. Data Validation and Constraints

#### Email Validation
- **Issue**: No constraints on email format
- **Recommendation**: Add check constraints for valid email format
- **SQL**:
```sql
-- Add email format validation
ALTER TABLE customers
  ADD CONSTRAINT valid_email CHECK (contactemail ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE employees
  ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

#### Status Field Constraints
- **Issue**: Status fields don't have domain constraints
- **Recommendation**: Add enum types or check constraints
- **SQL**:
```sql
-- Create enum type for status
CREATE TYPE customer_status AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT', 'FORMER');

-- Alter table to use enum
ALTER TABLE customers
  ALTER COLUMN status TYPE customer_status USING status::customer_status;
```

### 5. MCP Configuration Enhancements

Update the MCP configuration to explicitly define the schema:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "supabase",
      "url": "https://zrxezqllmpdlhiudutme.supabase.co",
      "service_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "schema": {
        "customers": {
          "description": "Customer business information",
          "columns": [
            {"name": "customerid", "type": "string", "description": "Unique customer identifier"},
            {"name": "customername", "type": "string", "description": "Business name"},
            {"name": "status", "type": "string", "description": "Customer status (ACTIVE, PROSPECT, etc.)"}
            // Additional columns...
          ]
        },
        "employees": {
          "description": "Employee information",
          "columns": [
            {"name": "employee_id", "type": "uuid", "description": "Unique employee identifier"},
            {"name": "first_name", "type": "string", "description": "Employee first name"},
            {"name": "role", "type": "string", "description": "Employee role/position"}
            // Additional columns...
          ]
        }
      }
    }
  }
}
```

## Implementation Phases

### Phase 1: Non-destructive Improvements
- Add indexes to existing tables
- Set up RLS policies
- Create audit mechanism
- Update MCP configuration

### Phase 2: Schema Enhancements
- Create new normalized tables
- Add validation constraints
- Update data types where safe

### Phase 3: Data Migration
- Migrate data to new structure
- Validate data integrity
- Remove deprecated columns/tables

## Testing Strategy

1. **Performance Testing**
   - Benchmark query performance before and after changes
   - Test with realistic data volumes

2. **Security Testing**
   - Verify RLS policies work as expected
   - Test with different user roles

3. **Data Integrity Testing**
   - Ensure constraints prevent invalid data
   - Verify audit trail captures all changes

## Monitoring Plan

- Set up query performance monitoring
- Track table sizes and growth rates
- Monitor index usage statistics
- Set up alerts for performance thresholds 