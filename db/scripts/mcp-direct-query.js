const readline = require('readline');

// Create readline interface to communicate with the MCP proxy
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Send a query to check project_documents table
console.log(
  JSON.stringify({
    type: 'query',
    table: 'information_schema.tables',
    filter: {
      table_schema: 'public',
      table_name: 'project_documents',
    },
    select: '*',
  })
);

// Listen for responses from MCP proxy
rl.on('line', line => {
  try {
    const response = JSON.parse(line);
    console.error('Received response:', response);

    // Check the response
    if (response.data && response.data.length > 0) {
      console.error('project_documents table exists');
    } else if (response.error) {
      console.error('Error:', response.error);
    } else {
      console.error('project_documents table does not exist');

      // Now check if the function exists
      console.log(
        JSON.stringify({
          type: 'query',
          table: 'information_schema.routines',
          filter: {
            routine_schema: 'public',
            routine_name: 'convert_estimate_to_project',
          },
          select: '*',
        })
      );
    }
  } catch (err) {
    console.error('Error parsing response:', err);
  }
});
