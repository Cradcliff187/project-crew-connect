// Supabase Functions Proxy for Windows PowerShell
// This script allows running supabase functions locally on Windows

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

// Add try-catch around client creation
let supabase;
try {
  console.error('[Proxy] Attempting to create Supabase client...');
  supabase = createClient(supabaseUrl, supabaseKey);
  console.error('[Proxy] Supabase client created successfully.');
} catch (error) {
  console.error('[Proxy] FATAL: Failed to create Supabase client:', error);
  // Exit if client creation fails, as the proxy is useless
  process.exit(1);
}

// Create interface for reading from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

console.error('Supabase MCP proxy started...');

// Process JSON requests from stdin
rl.on('line', async line => {
  try {
    const request = JSON.parse(line);

    // Handle different request types
    if (request.type === 'query') {
      await handleQuery(request);
    } else if (request.type === 'schema') {
      await handleSchemaRequest();
    } else if (request.type === 'ping') {
      sendResponse({ type: 'pong' });
    } else if (request.type === 'list_projects') {
      await handleListProjects();
    } else if (request.type === 'get_project') {
      await handleGetProject(request);
    } else if (request.type === 'exec_sql') {
      await handleExecSql(request);
    } else if (request.type === 'list_tables') {
      await handleListTables();
    } else if (request.type === 'list_columns') {
      await handleListColumns(request);
    } else if (request.type === 'table_data') {
      await handleTableData(request);
    } else if (request.type === 'rpc') {
      await handleRpc(request);
    } else if (request.type === 'vacuum') {
      await handleVacuum(request);
    } else if (request.type === 'backup') {
      await handleDatabaseBackup(request);
    } else if (request.type === 'analyze') {
      await handleAnalyze(request);
    } else if (request.type === 'direct_sql') {
      await handleDirectSql(request);
    } else {
      sendResponse({
        error: `Unsupported request type: ${request.type}`,
        request,
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    sendResponse({ error: error.message });
  }
});

async function handleQuery(request) {
  try {
    const { table, filter, select, limit, sql } = request;

    // If SQL is provided directly, execute it with direct SQL
    if (sql) {
      await handleDirectSql({ sql });
      return;
    }

    if (!table) {
      throw new Error('Table name is required');
    }

    let query = supabase.from(table).select(select || '*');

    // Apply filters if provided
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value);
      }
    }

    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    sendResponse({ data });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleSchemaRequest() {
  try {
    // Try to use the existing execute_sql_query function
    await handleExecSql({
      sql: "SELECT table_name, json_agg(json_build_object('name', column_name, 'type', data_type, 'nullable', is_nullable)) as columns FROM information_schema.columns WHERE table_schema = 'public' GROUP BY table_name ORDER BY table_name",
    });
  } catch (schemaError) {
    // Get a list of all tables and their columns through direct SQL
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) throw error;

    const schema = {};
    for (const table of data) {
      schema[table.table_name] = [];

      // Get columns for this table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');

      if (!columnsError && columns) {
        schema[table.table_name] = columns;
      }
    }

    sendResponse({ schema });
  }
}

async function handleListProjects() {
  try {
    sendResponse({
      data: [
        {
          id: 'zrxezqllmpdlhiudutme',
          name: 'AKC Revisions',
          organization_id: 'example-org-id',
          region: 'us-east-1',
        },
      ],
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleGetProject(request) {
  try {
    const { id } = request;

    sendResponse({
      data: {
        id: id || 'zrxezqllmpdlhiudutme',
        name: 'AKC Revisions',
        organization_id: 'example-org-id',
        region: 'us-east-1',
        status: 'active',
      },
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleExecSql(request) {
  try {
    const { sql } = request;

    if (!sql) {
      throw new Error('SQL query is required');
    }

    // Try to use the existing execute_sql_query function first
    try {
      const { data, error } = await supabase.rpc('execute_sql_query', { p_sql: sql });

      if (error) throw error;

      sendResponse({ data, message: 'SQL executed successfully via execute_sql_query' });
      return;
    } catch (queryError) {
      // If execute_sql_query fails, try execute_sql_command for non-SELECT statements
      try {
        const sqlType = getSqlType(sql);

        if (sqlType !== 'SELECT') {
          const { data, error } = await supabase.rpc('execute_sql_command', { p_sql: sql });

          if (error) throw error;

          sendResponse({
            data: [{ result: 'Command executed successfully' }],
            message: 'SQL executed successfully via execute_sql_command',
          });
          return;
        } else {
          throw new Error('Cannot execute SELECT statement with execute_sql_command');
        }
      } catch (commandError) {
        // If both functions fail, fall back to direct_sql
        await handleDirectSql(request);
      }
    }
  } catch (error) {
    await handleDirectSql(request);
  }
}

async function handleDirectSql(request) {
  try {
    const { sql } = request;

    if (!sql) {
      throw new Error('SQL query is required');
    }

    // NOTE: This is for basic SQL execution without using RPC
    // It will NOT work for all SQL statements but should handle common ones

    // Try to determine the SQL type
    const sqlType = getSqlType(sql);

    let result;

    if (sqlType === 'SELECT') {
      // For SELECT queries, we can use the REST API
      const { data, error } = await supabase.rpc('pg_query', { query_string: sql });

      if (error) {
        // Try a different approach for SELECT
        const { data: directData, error: directError } = await supabase
          .from('_dummy_for_raw_queries_')
          .select('*')
          .limit(1)
          .then(resp => {
            // This will fail, but we just need access to postgres()
            return supabase.postgres.query(sql);
          })
          .catch(async e => {
            // If we can access postgres() this way, use it
            try {
              return await supabase.postgres.query(sql);
            } catch (innerError) {
              return { error: innerError };
            }
          });

        if (directError) {
          throw directError;
        }

        result = directData;
      } else {
        result = data;
      }
    } else {
      // For other types, try the raw REST API
      // NOTE: This is experimental and may not work for all SQL types

      // We have to make direct fetch calls for non-SELECT statements
      const rawResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({ query_string: sql }),
      });

      if (!rawResponse.ok) {
        const errorText = await rawResponse.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }

      const rawData = await rawResponse.json();
      result = rawData;
    }

    sendResponse({
      data: result,
      message: 'SQL executed successfully via direct SQL',
      sql_type: sqlType,
    });
  } catch (error) {
    // Provide helpful message with suggestions
    sendResponse({
      error: error.message,
      message:
        'SQL execution failed. Try simpler SQL statements or create the required database functions.',
      help: 'The database has execute_sql_query and execute_sql_command functions that may help with SQL execution.',
    });
  }
}

// Helper function to determine SQL type
function getSqlType(sql) {
  const trimmedSql = sql.trim().toUpperCase();

  if (trimmedSql.startsWith('SELECT')) return 'SELECT';
  if (trimmedSql.startsWith('INSERT')) return 'INSERT';
  if (trimmedSql.startsWith('UPDATE')) return 'UPDATE';
  if (trimmedSql.startsWith('DELETE')) return 'DELETE';
  if (trimmedSql.startsWith('CREATE')) return 'CREATE';
  if (trimmedSql.startsWith('ALTER')) return 'ALTER';
  if (trimmedSql.startsWith('DROP')) return 'DROP';
  if (trimmedSql.startsWith('TRUNCATE')) return 'TRUNCATE';
  if (trimmedSql.startsWith('BEGIN') || trimmedSql.includes('DO $$')) return 'TRANSACTION';

  return 'UNKNOWN';
}

async function handleListTables() {
  try {
    // Use direct SQL instead of information_schema.tables
    const result = await handleDirectSql({
      sql: "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    });

    // The response is already sent by handleDirectSql
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleListColumns(request) {
  try {
    const { table } = request;

    if (!table) {
      throw new Error('Table name is required');
    }

    // Use direct SQL instead of information_schema.columns
    const result = await handleDirectSql({
      sql: `SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${table}'
            ORDER BY ordinal_position`,
    });

    // The response is already sent by handleDirectSql
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleTableData(request) {
  try {
    const { table, limit = 100, offset = 0, order_by, filter } = request;

    if (!table) {
      throw new Error('Table name is required');
    }

    let query = supabase
      .from(table)
      .select('*')
      .range(offset, offset + limit - 1);

    if (order_by) {
      const [column, direction] = order_by.split(':');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    sendResponse({ data });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleRpc(request) {
  try {
    const { function_name, params } = request;

    if (!function_name) {
      throw new Error('Function name is required');
    }

    const { data, error } = await supabase.rpc(function_name, params || {});

    if (error) throw error;
    sendResponse({ data });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleVacuum(request) {
  try {
    const { table, full = false } = request;

    // Try to use the execute_sql_command function for VACUUM
    let sql = '';

    if (table) {
      sql = `VACUUM ${full ? 'FULL' : ''} ${table}`;
    } else {
      sql = `VACUUM ${full ? 'FULL' : ''}`;
    }

    try {
      const { data, error } = await supabase.rpc('execute_sql_command', { p_sql: sql });

      if (error) throw error;

      sendResponse({
        message: table
          ? `VACUUM ${full ? 'FULL' : ''} completed for table: ${table}`
          : `VACUUM ${full ? 'FULL' : ''} completed for all tables`,
      });
      return;
    } catch (commandError) {
      // Fall back to direct SQL
      await handleDirectSql({ sql });
    }
  } catch (error) {
    sendResponse({
      error: error.message,
      message: 'VACUUM operations require elevated privileges',
    });
  }
}

async function handleDatabaseBackup(request) {
  try {
    // This is a placeholder as actual backups would be handled by Supabase
    sendResponse({
      message:
        'Database backup functionality is not implemented in this proxy. Please use Supabase dashboard for backups.',
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleAnalyze(request) {
  try {
    const { table } = request;

    // Try to use the execute_sql_command function for ANALYZE
    let sql = '';

    if (table) {
      sql = `ANALYZE ${table}`;
    } else {
      sql = 'ANALYZE';
    }

    try {
      const { data, error } = await supabase.rpc('execute_sql_command', { p_sql: sql });

      if (error) throw error;

      sendResponse({
        message: table
          ? `ANALYZE completed for table: ${table}`
          : 'ANALYZE completed for all tables',
      });
      return;
    } catch (commandError) {
      // Fall back to direct SQL
      await handleDirectSql({ sql });
    }
  } catch (error) {
    sendResponse({
      error: error.message,
      message: 'ANALYZE operations require elevated privileges',
    });
  }
}

function sendResponse(response) {
  console.log(JSON.stringify(response));
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('Supabase MCP proxy terminated');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Supabase MCP proxy terminated');
  process.exit(0);
});
