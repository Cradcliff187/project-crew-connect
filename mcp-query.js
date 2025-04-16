console.log('Querying Supabase via MCP...');

// Sample query - this should be processed by the MCP proxy
const projectDocumentsQuery = {
  type: 'query',
  table: 'information_schema.tables',
  filter: {
    table_schema: 'public',
    table_name: 'project_documents',
  },
  select: '*',
  limit: 1,
};

console.log('Checking if project_documents table exists...');
console.log(JSON.stringify(projectDocumentsQuery));

// The MCP proxy should intercept and process this query
// Results are returned via stdout

// Query to check if the function exists
const functionQuery = {
  type: 'query',
  table: 'information_schema.routines',
  filter: {
    routine_schema: 'public',
    routine_name: 'convert_estimate_to_project',
  },
  select: '*',
  limit: 1,
};

console.log('Checking if convert_estimate_to_project function exists...');
console.log(JSON.stringify(functionQuery));
