# Webhook System Documentation

## Overview

The webhook system provides real-time automated business logic processing for database changes in the AKC CRM system. It consists of database triggers that automatically call Edge Functions when data changes occur.

## Architecture

### Components

1. **Database Triggers** - Capture INSERT, UPDATE, DELETE operations on key tables
2. **Edge Functions** - Process webhook calls and execute business logic
3. **Webhook Handlers** - Specific logic for different types of data changes

### Flow

```
Database Change → Trigger → HTTP Request → Edge Function → Business Logic → Database Update
```

## Active Webhooks

### Database Triggers

The following tables have active webhook triggers:

#### Core Business Tables

- `projects` - Project lifecycle and financial updates
- `time_entries` - Labor cost calculations and budget impact
- `expenses` - Cost tracking and project expense updates
- `project_budget_items` - Budget vs actual calculations
- `change_orders` - Approval workflow and project impact
- `receipts` - OCR processing and expense automation

#### Supporting Tables

- `customers` - Contact management updates
- `employees` - Rate changes and assignment updates
- `estimates` - Quote processing and conversion tracking
- `maintenance_work_orders` - Work order lifecycle
- `subcontractors` - Vendor management updates
- `vendors` - Supplier information changes

### Edge Functions

#### 1. `database-change-handler`

**Purpose**: Main business logic processor for database changes

**Handles**:

- Project financial calculations (contract value, budget status)
- Budget vs actual amount tracking
- Change order approval workflows
- Receipt processing and expense creation
- Time entry cost allocation
- Project expense totals

**URL**: `https://zrxezqllmpdlhiudutme.supabase.co/functions/v1/database-change-handler`

#### 2. `calendarWebhook`

**Purpose**: Google Calendar integration handler

**Handles**:

- Google Calendar push notifications
- Bi-directional calendar synchronization
- Event creation, updates, and deletions
- Schedule item mapping

**URL**: `https://zrxezqllmpdlhiudutme.supabase.co/functions/v1/calendarWebhook`

#### 3. `generate-estimate-pdf`

**Purpose**: PDF generation service

**Handles**:

- Estimate PDF creation
- Document storage and linking
- File metadata management

**URL**: `https://zrxezqllmpdlhiudutme.supabase.co/functions/v1/generate-estimate-pdf`

## Business Logic Automation

### Project Financial Management

**When**: Projects are updated or related records change
**Actions**:

- Calculate contract value (original + change orders)
- Update current expenses from time entries and expenses
- Determine budget status (on_track, at_risk, over_budget)
- Track change order impacts

### Budget Tracking

**When**: Budget items, time entries, or expenses change
**Actions**:

- Calculate actual amounts from time and material costs
- Update budget item actual vs estimated
- Roll up project totals
- Alert when budget thresholds exceeded

### Change Order Processing

**When**: Change orders are approved (status = 'Issued')
**Actions**:

- Apply cost and revenue impacts to projects
- Update contract values
- Recalculate project financials
- Track change order history

### Receipt Automation

**When**: Receipts are uploaded or approved
**Actions**:

- Trigger OCR processing for new receipts
- Create expense entries from approved receipts
- Link receipts to projects or work orders
- Update project expense totals

### Time Entry Processing

**When**: Time entries are created, updated, or deleted
**Actions**:

- Calculate labor costs using employee rates
- Update budget item actuals
- Update project current expenses
- Track labor allocation by project/budget item

## Configuration

### Environment Variables

The webhook system requires the following Supabase secrets:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - For calendar integration
- `GOOGLE_PRIVATE_KEY` - For calendar integration
- `DEFAULT_PROJECT_ID_FOR_NEW_GCAL_EVENTS` - Default project for new calendar events

### Database Function

The `notify_webhook_with_data()` function handles:

- Payload preparation (current and previous record data)
- HTTP request to Edge Functions
- Error handling and logging
- Proper trigger return values

### Security

- All webhook triggers use `SECURITY DEFINER` for consistent permissions
- Error handling prevents webhook failures from blocking database operations
- Authentication handled via service role key
- CORS headers properly configured for web requests

## Testing

### Test Webhook System

```sql
-- Test project webhook
INSERT INTO projects (
    projectid,
    projectname,
    description,
    original_selling_price,
    total_budget
) VALUES (
    'test-' || extract(epoch from now())::text,
    'Test Project',
    'Testing webhook functionality',
    50000.00,
    45000.00
);

-- Test time entry webhook
INSERT INTO time_entries (
    id,
    entity_type,
    entity_id,
    employee_id,
    date_worked,
    start_time,
    end_time,
    hours_worked,
    hours_regular,
    hours_ot
) VALUES (
    gen_random_uuid(),
    'project',
    '[PROJECT_ID]',
    '[EMPLOYEE_ID]',
    CURRENT_DATE,
    '09:00:00',
    '17:00:00',
    8.0,
    8.0,
    0.0
);
```

### Verify Results

Check that:

- Project `current_expenses` updated automatically
- Budget calculations processed
- `updated_at` timestamps reflect changes
- No error messages in Edge Function logs

## Troubleshooting

### Common Issues

1. **Webhook Not Triggering**

   - Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name LIKE '%webhook%'`
   - Check Edge Function is deployed and active
   - Verify Supabase secrets are configured

2. **Business Logic Not Working**

   - Check Edge Function logs for errors
   - Verify table relationships and foreign keys
   - Ensure proper data types and constraints

3. **Performance Issues**
   - Monitor webhook execution time
   - Consider async processing for heavy operations
   - Review database query performance

### Monitoring

- Edge Function logs available in Supabase dashboard
- Database trigger warnings logged to PostgreSQL logs
- Webhook payload includes timestamp for tracking
- Error handling prevents cascade failures

## Deployment

### Initial Setup

1. Deploy Edge Functions:

   ```bash
   supabase functions deploy database-change-handler
   supabase functions deploy calendarWebhook
   supabase functions deploy generate-estimate-pdf
   ```

2. Apply database migrations:

   ```bash
   supabase db push
   ```

3. Configure environment variables in Supabase dashboard

### Updates

- Edge Functions can be redeployed without database changes
- Database triggers require migration for schema changes
- Test changes in development environment first

## Status

**✅ FULLY OPERATIONAL**

- 12 tables with active webhook triggers
- 3 Edge Functions deployed and responding
- End-to-end testing completed successfully
- Business logic automation working correctly
- Error handling and logging implemented
- Documentation complete

Last Updated: June 2, 2025
