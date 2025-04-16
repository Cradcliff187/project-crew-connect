# Supabase MCP Integration for Cursor

This integration allows Cursor AI to interact directly with the Supabase database using the Model Context Protocol (MCP).

## Overview

The setup consists of:

- A proxy script (`supabase/functions/proxy.js`) that connects to Supabase
- An MCP configuration (`.cursor/mcp.json`) that tells Cursor to use this proxy

## How to Launch

To start the Supabase MCP integration:

1. Open a terminal in the project root directory
2. Run the command:
   ```
   node ./supabase/functions/proxy.js
   ```
3. You should see the message: "Supabase MCP proxy started..."
4. Leave this terminal window open while using Cursor

## Verifying It's Working

When properly configured, you should see:

1. The "Supabase MCP proxy started..." message in the terminal
2. In Cursor, no MCP configuration errors should appear
3. Cursor AI should be able to reference and work with your Supabase data

## Troubleshooting

If you encounter issues:

1. **Proxy Script Errors**:

   - Check that the Supabase URL and API key in `proxy.js` are correct
   - Ensure `@supabase/supabase-js` is installed: `npm install @supabase/supabase-js`

2. **MCP Configuration Errors**:

   - Verify `.cursor/mcp.json` has the correct path to the proxy script
   - Make sure the "enabled" property is set to true

3. **Cursor Connection Issues**:
   - Restart Cursor after making changes to the MCP configuration
   - Check that no other process is using the same port

## Common Tasks

### Accessing Estimate Versions

Cursor AI can now help with:

- Creating new estimate versions
- Converting estimates to projects
- Querying estimate revision history
- Troubleshooting database-related issues

### Modifying the Proxy

If you need to add functionality to the proxy:

1. Edit `supabase/functions/proxy.js`
2. Add new request handlers as needed
3. Restart the proxy script

## Security Note

The proxy script contains your Supabase API key. Ensure this repository remains private and don't commit any changes to the API key to public repositories.
