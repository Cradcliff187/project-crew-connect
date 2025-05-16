# Security Findings

This document outlines the security findings related to financial data in the application, with a focus on Row Level Security (RLS) policies, role-based access, and service vs. anon key usage.

## RLS Policies Analysis

Without direct access to the full Supabase schema, we can infer the following based on code examination:

### Observations

1. **RLS Coverage**: We were unable to find explicit RLS policies for financial tables in the migrations or schema files. This is a significant concern as financial data should be protected at the database level.

2. **Organization-Specific Data Isolation**: From the code analyzed, there's no clear indication that organization-specific financial data is adequately isolated in multi-tenant scenarios.

3. **Service vs. Anon Key Usage**:

   - Most frontend queries appear to use the default Supabase client which likely uses the anon key
   - Server-side operations may use service keys, but this isn't explicitly defined in the code examined

4. **Estimate & Project Security**: No explicit checks were found to verify that users can only access estimates or projects within their organization.

5. **Financial Calculation Exposure**: Financial calculations such as margins and profits are performed client-side, potentially exposing sensitive business metrics to unauthorized users through browser inspection.

## Access Control Issues

### Critical Findings

1. **Financial Summary Endpoint Security**:

   - The financial summary data appears to be fetched without specific organization constraints
   - Potential risk: Users could access financial data from other organizations

2. **Budget Items Access**:

   - Budget items appear to be fetched only by `project_id`
   - Potential risk: If `project_id` is known, users might access budget data across organizations

3. **Change Order Approval Process**:

   - No clear role-based restrictions on who can approve change orders
   - Potential risk: Unauthorized users could approve financial changes

4. **Missing Role-Based Controls**:
   - No clear distinction between roles like "viewer", "editor", and "financial approver"
   - Potential risk: Users may have excessive privileges for financial operations

## Endpoints That May Bypass RLS

1. **Convert Estimate to Project**:

   - Uses a PostgreSQL function that might not enforce RLS policies
   - Potential risk: RLS could be bypassed during estimate conversion

2. **Project Budget Updates**:

   - Direct updates to budget totals don't appear to have RLS checks
   - Potential risk: Unauthorized budget modifications

3. **Financial Reporting Endpoints**:
   - Report generation appears to use direct queries without explicit organization filters
   - Potential risk: Cross-organization data leakage

## Recommendations

### High Priority

1. **Implement RLS Policies**:

   ```sql
   -- Example policy for estimates table
   CREATE POLICY "Estimates are visible to users in the same organization"
   ON estimates
   FOR SELECT
   USING (
     auth.uid() IN (
       SELECT user_id FROM organization_users
       WHERE organization_id = (
         SELECT organization_id FROM estimates
         WHERE estimateid = estimates.estimateid
       )
     )
   );
   ```

2. **Add Organization ID Column**:

   - Ensure all financial tables have an `organization_id` column
   - Make this column mandatory and use it in RLS policies

3. **Implement Service Role for Financial Operations**:

   - Create dedicated API endpoints for sensitive financial operations
   - Use service role (not anon) for these endpoints
   - Example:

     ```typescript
     // Server-side endpoint using service role
     export async function updateBudget(req, res) {
       const supabaseAdmin = createClient(
         process.env.SUPABASE_URL,
         process.env.SUPABASE_SERVICE_KEY
       );

       // Perform authorization check here
       // Then perform budget update
     }
     ```

### Medium Priority

1. **Role-Based Access Control**:

   - Define specific roles for financial actions (view, edit, approve)
   - Implement checking mechanisms in UI and API endpoints

2. **Audit Logging**:

   - Add audit logging for all financial modifications
   - Example trigger:
     ```sql
     CREATE TRIGGER log_budget_changes
     AFTER UPDATE ON projects
     FOR EACH ROW
     WHEN (OLD.total_budget IS DISTINCT FROM NEW.total_budget)
     EXECUTE FUNCTION log_financial_change();
     ```

3. **Server-Side Calculations**:
   - Move sensitive financial calculations to server-side
   - Return only necessary data to front-end

### Low Priority

1. **Input Validation**:

   - Add server-side validation for all financial inputs
   - Prevent negative values where inappropriate
   - Enforce reasonable limits on financial values

2. **Response Sanitization**:
   - Review all API responses to ensure sensitive financial data is only sent when necessary
   - Mask or omit internal financial metrics from general user views

## Overall Security Assessment

Based on the limited access to the security implementation details, the financial data security appears to have significant gaps. The lack of visible RLS policies and organization-level data isolation represents a critical security risk.

The application requires a comprehensive security review focused specifically on financial data access controls and separation of concerns between different user roles and organizations.
