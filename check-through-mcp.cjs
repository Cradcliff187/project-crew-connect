// CommonJS script to check tables through MCP proxy
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the MCP proxy
const proxyPath = path.join(__dirname, 'supabase', 'functions', 'proxy.js');

console.log('Checking if proxy exists at:', proxyPath);
if (!fs.existsSync(proxyPath)) {
  console.error('Proxy not found!');
  process.exit(1);
}

// Start the proxy
const proxy = spawn('node', [proxyPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Handle proxy output
proxy.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString());
    console.log('MCP Response:', response);

    if (response.type === 'pong') {
      console.log('MCP ping successful! Now checking tables...');

      // Query for project_documents table
      proxy.stdin.write(
        JSON.stringify({
          type: 'query',
          table: 'information_schema.tables',
          filter: {
            table_schema: 'public',
            table_name: 'project_documents',
          },
          select: '*',
        }) + '\n'
      );
    } else if (response.data !== undefined) {
      // This is a query response
      if (response.data.length > 0) {
        console.log('Table exists:', response.data);
      } else {
        console.log('Table does not exist or is empty');

        // Next check the function
        proxy.stdin.write(
          JSON.stringify({
            type: 'query',
            table: 'information_schema.routines',
            filter: {
              routine_schema: 'public',
              routine_name: 'convert_estimate_to_project',
            },
            select: '*',
          }) + '\n'
        );
      }
    }
  } catch (err) {
    console.log('Raw output (non-JSON):', data.toString());
  }
});

proxy.stderr.on('data', data => {
  console.error('Proxy stderr:', data.toString());
});

proxy.on('close', code => {
  console.log(`Proxy exited with code ${code}`);
});

// Send ping to test connection
setTimeout(() => {
  console.log('Sending ping to MCP proxy...');
  proxy.stdin.write(JSON.stringify({ type: 'ping' }) + '\n');
}, 1000);
