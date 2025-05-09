# Supabase MCP Maintenance Guide

This guide provides detailed instructions for maintaining, troubleshooting, and **using** the Supabase MCP (Model Context Protocol) integration in this project.

## MCP Configuration Overview

- MCP is configured in `.cursor/mcp.json`.
- The current setup uses PowerShell to set the Supabase Personal Access Token (PAT) and launch the MCP server for full access.

**Current config:**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "powershell.exe",
      "args": [
        "-Command",
        "$env:SUPABASE_ACCESS_TOKEN='YOUR_SUPABASE_PAT'; npx -y @supabase/mcp-server-supabase@latest"
      ]
    }
  }
}
```

Replace `YOUR_SUPABASE_PAT` with your actual Supabase Personal Access Token if updating manually.

## How to Use MCP in Cursor (For AI Agents & Users)

### 1. **Start MCP in Cursor**

- Open Cursor.
- Go to **Settings > MCP**.
- Ensure the Supabase MCP server is toggled ON.
- Wait for the status to show **"Tools available"** (not "No tools available").

### 2. **Available MCP Tools**

Once MCP is active, the following tools are available to the AI agent and user:

| Tool              | Description                           | Example                                                                                                      |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `list_tables`     | List all tables in the database       | `{ "type": "list_tables" }`                                                                                  |
| `list_columns`    | List columns in a specific table      | `{ "type": "list_columns", "table": "vendors" }`                                                             |
| `exec_sql`        | Execute SQL queries                   | `{ "type": "exec_sql", "sql": "SELECT * FROM vendors LIMIT 3;" }`                                            |
| `apply_migration` | Applies SQL migration to the database | `{ "type": "apply_migration", "name": "create_table", "sql": "CREATE TABLE test (id serial primary key);" }` |
| `list_extensions` | Lists all extensions in the database  | `{ "type": "list_extensions" }`                                                                              |
| `list_migrations` | Lists all migrations in the database  | `{ "type": "list_migrations" }`                                                                              |
| `rpc_call`        | Call a Postgres function (RPC)        | `{ "type": "rpc_call", "function": "function_name", "params": { "param1": "value1" } }`                      |

### 3. **How to Use the Tools (AI Agent or User)**

- In any Cursor chat or command interface, you can issue a tool request using the above JSON format.
- The AI agent can use these tools to:
  - List all tables or columns
  - Run any SQL query (read or write)
  - Apply migrations
  - Call Postgres functions

#### **Example Queries:**

- List all tables:
  ```json
  { "type": "list_tables" }
  ```
- List columns in a table:
  ```json
  { "type": "list_columns", "table": "vendors" }
  ```
- Select data:
  ```json
  { "type": "exec_sql", "sql": "SELECT * FROM vendors LIMIT 3;" }
  ```
- Insert data:
  ```json
  { "type": "exec_sql", "sql": "INSERT INTO test_logs (note) VALUES ('MCP write test');" }
  ```
- Apply a migration:
  ```json
  {
    "type": "apply_migration",
    "name": "add_table",
    "sql": "CREATE TABLE test (id serial primary key);"
  }
  ```

## Troubleshooting MCP in Cursor

- If you see **"No tools available"** or **"Canceled"**, MCP is not running. Check:
  - Node.js and npx are installed and in your PATH.
  - The Supabase PAT is valid.
  - The PowerShell command in `.cursor/mcp.json` is correct.
- Try toggling the MCP server off and on in Cursor settings.
- Check for error messages in the MCP server output.

## Security Warnings

- **Never commit `.cursor/mcp.json` with real credentials to version control.**
- Always keep `.cursor/mcp.json` in `.gitignore`.
- If a PAT is leaked, rotate it immediately in Supabase.

## Updating MCP Configuration

- Edit `.cursor/mcp.json` as shown above if you need to update the PAT or command.
- Restart Cursor after making changes.

## MCP Verification Process

1. Ensure MCP is running and "Tools available" is shown in Cursor.
2. Run a simple query (e.g., `{ "type": "list_tables" }`) to confirm connectivity.
3. The AI agent can now use any of the above tools to access or update Supabase as needed.
