# Executing SQL in Supabase - Updated Guide

This document provides updated instructions for executing SQL in Supabase using the improved MCP proxy that was fixed in May 2025.

## Preferred Methods for SQL Execution

After fixing the SQL execution issues, the following methods are recommended in order of preference:

### 1. Direct Table API (Most Reliable)

```javascript
// For simple queries
const { data, error } = await supabase
  .from('time_entries')
  .select('*')
  .eq('entity_type', 'project')
  .limit(10);

// For more complex filtering
const { data, error } = await supabase
  .from('time_entries')
  .select('id, date_worked, hours_worked')
  .gt('date_worked', '2025-01-01')
  .lt('date_worked', '2025-04-30')
  .order('date_worked', { ascending: false })
  .limit(20);
```

### 2. RPC Functions (For SQL Queries)

```javascript
// For SELECT queries
const { data, error } = await supabase.rpc('execute_sql_query', {
  p_sql: "SELECT * FROM time_entries WHERE entity_type = 'project' LIMIT 5",
});

// For non-SELECT statements (INSERT, UPDATE, etc.)
const { data, error } = await supabase.rpc('execute_sql_command', {
  p_sql: "UPDATE time_entries SET notes = 'Updated' WHERE id = '12345'",
});
```

### 3. MCP Operations (For AI Agents)

```javascript
// Through the MCP proxy
const request = {
  type: 'exec_sql',
  sql: 'SELECT * FROM time_entries LIMIT 5',
};

// Or for table-specific operations
const request = {
  type: 'query',
  table: 'time_entries',
  filter: { entity_type: 'project' },
  limit: 5,
};
```

## Working with Calendar Fields

The calendar integration fields have been confirmed to exist in the following tables:

- `time_entries`
- `maintenance_work_orders`
- `project_milestones`
- `contact_interactions`

Example query for calendar fields:

```javascript
// Get entries with calendar sync enabled
const { data, error } = await supabase
  .from('time_entries')
  .select('*')
  .eq('calendar_sync_enabled', true)
  .limit(10);

// Update calendar event ID
const { data, error } = await supabase
  .from('time_entries')
  .update({ calendar_event_id: 'google-event-id-123' })
  .eq('id', 'time-entry-id');
```

## Limitations and Workarounds

The fixed proxy has some limitations to be aware of:

1. **Complex JOINs**: Complex JOIN operations should be handled through RPC functions rather than direct SQL
2. **Information Schema**: Access to information_schema is limited but implemented through hardcoded common tables
3. **Transactions**: Multi-statement transactions are not fully supported

## Developer Tools

For testing SQL execution:

1. **Start the MCP Server**:

   ```bash
   node start-mcp.js
   ```

2. **Test SQL Execution**:

   ```bash
   node test-fixed-proxy.js
   ```

3. **Custom SQL Tests**:
   ```javascript
   // Create a file like test-my-sql.js
   // Use the pattern in test-fixed-proxy.js but customize your SQL
   ```

## Schema Documentation

For up-to-date schema information, execute:

```javascript
// List all tables
const request = { type: 'list_tables' };

// Get columns for a specific table
const request = {
  type: 'list_columns',
  table: 'time_entries',
};
```

## Troubleshooting

If you encounter SQL execution issues:

1. **Start Simple**: Begin with direct table API calls rather than complex SQL
2. **Check Table Names**: Verify table names and column names are correct
3. **Use Proper Types**: Ensure data types match (strings for text, numbers for numeric fields)
4. **Limit Results**: Always use LIMIT in queries to avoid excessive data transfer
5. **Error Handling**: Check both `data` and `error` responses in all cases
