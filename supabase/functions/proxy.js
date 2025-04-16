import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { table, filter, select, limit } = request;

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
    // Get list of tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      throw tablesError;
    }

    const schema = {};

    // For each table, get its columns
    for (const { table_name } of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table_name);

      if (columnsError) {
        console.error(`Error fetching columns for table ${table_name}:`, columnsError);
        continue;
      }

      schema[table_name] = columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
      }));
    }

    sendResponse({ schema });
  } catch (error) {
    sendResponse({ error: error.message });
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
