// Simple script to check if tables and functions exist
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing MCP proxy connection...');

// Find the proxy script
const proxyPath = path.join(process.cwd(), 'supabase', 'functions', 'proxy.js');

if (!fs.existsSync(proxyPath)) {
  console.error(`Proxy script not found at ${proxyPath}`);
  process.exit(1);
}

// Try to run a test query through the proxy
try {
  const command = `echo '{"type":"ping"}' | node ${proxyPath}`;
  const result = execSync(command, { encoding: 'utf8' });
  console.log('Ping result:', result);

  // If ping works, try a real query
  const tableQuery = `echo '{"type":"query","table":"information_schema.tables","filter":{"table_schema":"public","table_name":"project_documents"},"select":"*"}' | node ${proxyPath}`;
  const tableResult = execSync(tableQuery, { encoding: 'utf8' });
  console.log('Table query result:', tableResult);

  const parsedResult = JSON.parse(tableResult);
  if (parsedResult.data && parsedResult.data.length > 0) {
    console.log('project_documents table exists!');
  } else if (parsedResult.error) {
    console.log('Error checking table:', parsedResult.error);
  } else {
    console.log('project_documents table does not exist');
  }

  // Check if function exists
  const functionQuery = `echo '{"type":"query","table":"information_schema.routines","filter":{"routine_schema":"public","routine_name":"convert_estimate_to_project"},"select":"*"}' | node ${proxyPath}`;
  const functionResult = execSync(functionQuery, { encoding: 'utf8' });
  console.log('Function query result:', functionResult);

  const parsedFuncResult = JSON.parse(functionResult);
  if (parsedFuncResult.data && parsedFuncResult.data.length > 0) {
    console.log('convert_estimate_to_project function exists!');
  } else if (parsedFuncResult.error) {
    console.log('Error checking function:', parsedFuncResult.error);
  } else {
    console.log('convert_estimate_to_project function does not exist - need to create it!');
  }
} catch (err) {
  console.error('Error executing proxy command:', err);
}
