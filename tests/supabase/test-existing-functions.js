// Test MCP Existing Functions
// Tests the database's execute_sql_query and execute_sql_command functions

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the MCP proxy
const proxyPath = path.join(__dirname, 'supabase', 'functions', 'proxy.js');

console.log('\n🧪 Testing MCP Database Functions');
console.log('===============================\n');

if (!fs.existsSync(proxyPath)) {
  console.error('❌ FAILED: Proxy script not found!');
  process.exit(1);
}

// Start the proxy with piped stdio for testing
const proxy = spawn('node', [proxyPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Track test completion
let testsDone = 0;
const totalTests = 2; // One query test and one command test
let testsPassed = 0;

// Collect stderr output
proxy.stderr.on('data', data => {
  console.log(`[stderr]: ${data.toString().trim()}`);
});

// Process stdout from the proxy
proxy.stdout.on('data', data => {
  const output = data.toString().trim();
  console.log(`[stdout]: ${output}`);

  try {
    const response = JSON.parse(output);

    if (response.type === 'pong') {
      console.log('✅ Connection established');

      // First test: Use exec_sql instead of direct RPC call
      console.log('\n🔍 TEST 1: Testing SQL query execution...');
      proxy.stdin.write(
        JSON.stringify({
          type: 'exec_sql',
          sql: 'SELECT current_database() as db, current_timestamp as time',
        }) + '\n'
      );
    } else if ((response.data || response.message) && testsDone === 0) {
      console.log('✅ TEST 1 PASSED: SQL query execution works!');
      testsPassed++;
      testsDone++;

      // Second test: Use exec_sql for a command that doesn't return data
      console.log('\n🔍 TEST 2: Testing SQL command execution...');
      const testTableName = `_mcp_test_${Date.now()}`;

      proxy.stdin.write(
        JSON.stringify({
          type: 'exec_sql',
          sql: `
          DO $$
          BEGIN
            CREATE TABLE IF NOT EXISTS ${testTableName} (id SERIAL PRIMARY KEY, test_column TEXT);
            INSERT INTO ${testTableName} (test_column) VALUES ('Test successful');
            DROP TABLE IF EXISTS ${testTableName};
          END;
          $$;
        `,
        }) + '\n'
      );
    } else if ((response.data || response.message) && testsDone === 1) {
      console.log('✅ TEST 2 PASSED: SQL command execution works!');
      testsPassed++;
      testsDone++;

      // All tests complete
      finishTests();
    } else if (response.error) {
      console.log(`❌ ERROR: ${response.error}`);
      testsDone++;

      if (testsDone >= totalTests) {
        finishTests();
      } else {
        // If the first test failed, try the second test anyway
        if (testsDone === 0) {
          testsDone++;
          console.log('\n🔍 TEST 2: Testing SQL command execution...');
          const testTableName = `_mcp_test_${Date.now()}`;

          proxy.stdin.write(
            JSON.stringify({
              type: 'exec_sql',
              sql: `
              DO $$
              BEGIN
                CREATE TABLE IF NOT EXISTS ${testTableName} (id SERIAL PRIMARY KEY, test_column TEXT);
                INSERT INTO ${testTableName} (test_column) VALUES ('Test successful');
                DROP TABLE IF EXISTS ${testTableName};
              END;
              $$;
            `,
            }) + '\n'
          );
        }
      }
    }
  } catch (err) {
    // Not JSON or not expected format
  }
});

// Send initial ping
proxy.stdin.write(JSON.stringify({ type: 'ping' }) + '\n');

// Set timeout to kill proxy if tests don't complete
const timeout = setTimeout(() => {
  console.error('❌ TESTS TIMED OUT: Some tests did not complete within the timeout period.');
  finishTests();
}, 10000);

// Finish tests and summarize
function finishTests() {
  clearTimeout(timeout);

  console.log('\n📋 Test Summary');
  console.log('-------------');
  console.log(`Tests passed: ${testsPassed}/${totalTests}`);

  if (testsPassed === totalTests) {
    console.log('\n✅ ALL TESTS PASSED: The SQL execution is working!\n');
    console.log('This means the AI agent can:');
    console.log('• Execute SQL queries through the MCP');
    console.log('• Run SQL commands through the MCP');
    console.log('• Perform any database operation you need\n');
  } else if (testsPassed > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: Some SQL execution features are working.\n');
  } else {
    console.log('\n❌ TESTS FAILED: SQL execution is not working properly.\n');
  }

  // Terminate proxy
  proxy.kill();
  process.exit(testsPassed === totalTests ? 0 : 1);
}

// Handle proxy exit
proxy.on('close', code => {
  if (code !== 0 && testsDone < totalTests) {
    console.error(`\n❌ PROXY ERROR: MCP proxy exited with code ${code} before tests completed.`);
  }
});
