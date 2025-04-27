# Supabase MCP Integration for Cursor

This integration allows Cursor AI to interact directly with the Supabase database using the Model Context Protocol (MCP).

## Verified Capabilities

The following capabilities have been tested and confirmed working:

- ✅ Basic connectivity (ping/pong)
- ✅ Reading data from tables (querying)
- ✅ Listing projects and getting project details
- ✅ SQL execution via existing database functions

## How to Launch

To start the Supabase MCP integration:

1. Open a terminal in the project root directory
2. Run the command:
   ```
   node start-mcp.js
   ```
3. You should see a successful connection message
4. Leave this terminal window open while using Cursor

## For AI Agents: Available Operations

The MCP proxy supports the following operations:

| Operation       | Description                         | Example Usage                                                                 | Status     |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `ping`          | Check server responsiveness         | `{"type":"ping"}`                                                             | ✅ Working |
| `query`         | Query a table with optional filters | `{"type":"query","table":"projects","filter":{"status":"active"},"limit":10}` | ✅ Working |
| `list_projects` | List Supabase projects              | `{"type":"list_projects"}`                                                    | ✅ Working |
| `get_project`   | Get project details                 | `{"type":"get_project","id":"zrxezqllmpdlhiudutme"}`                          | ✅ Working |
| `exec_sql`      | Execute arbitrary SQL statements    | `{"type":"exec_sql","sql":"SELECT * FROM projects LIMIT 5"}`                  | ✅ Working |

## Database Details

The Supabase project this MCP connects to:

- **Project ID**: zrxezqllmpdlhiudutme
- **Project Name**: AKC Revisions

## What You Can Do as an AI Agent

As an AI assistant, you can help with:

1. **Database Querying**:

   - Query data from tables using the `query` operation
   - Execute SQL queries directly using the `exec_sql` operation
   - Analyze and interpret results from database queries

2. **Project Information**:

   - View basic project details using the `get_project` operation
   - List all projects with the `list_projects` operation

3. **Database Analysis and Maintenance**:
   - Execute SQL to examine database structure
   - Run maintenance operations like VACUUM and ANALYZE
   - Make schema changes when necessary
   - Optimize database performance

## Existing Database Functions

The database already has the following useful functions:

1. **execute_sql_query** - For executing SQL queries that return data:

   ```sql
   -- This function takes a SQL query and returns results as JSON
   -- Parameter: p_sql text
   -- Returns: SETOF json
   -- Example: SELECT * FROM execute_sql_query('SELECT * FROM projects LIMIT 5');
   ```

2. **execute_sql_command** - For executing SQL commands that don't return data:
   ```sql
   -- This function executes SQL commands that don't return data
   -- Parameter: p_sql text
   -- Returns: void
   -- Example: SELECT execute_sql_command('CREATE INDEX IF NOT EXISTS idx_project_name ON projects(name)');
   ```

## Security Note

The MCP integration uses a Supabase API key with service_role permissions, which grants significant access to the database. Ensure this repository remains private.

## Troubleshooting

1. If the connection fails:

   - Make sure you've run `node start-mcp.js` and the terminal shows a successful connection
   - Restart Cursor after starting the MCP server
   - Check that your network allows connections to the Supabase API

2. If SQL execution fails:
   - For SELECT queries, use the `execute_sql_query` function
   - For non-SELECT statements (CREATE, INSERT, etc.), use the `execute_sql_command` function
   - Complex SQL might need to be simplified

## Quick Reference for Cursor AI

To access the database in your conversations with Cursor AI:

1. Start the MCP server with `node start-mcp.js`
2. Keep the terminal window open
3. Cursor AI can now query the database and execute SQL commands

## For Developers

To verify the MCP connection is working:

```
node test-mcp-connection.js  # Tests basic connectivity
node test-query.js           # Tests querying data
node test-existing-functions.js  # Tests SQL execution via database functions
```
