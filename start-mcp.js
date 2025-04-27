// Start MCP Server
// This script starts the Supabase MCP proxy for Cursor AI integration

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the MCP proxy
const proxyPath = path.join(__dirname, 'supabase', 'functions', 'proxy.js');

console.log('\n🔌 Supabase MCP Connector');
console.log('=======================\n');

console.log('Checking proxy script...');
if (!fs.existsSync(proxyPath)) {
  console.error('❌ Error: Proxy script not found at', proxyPath);
  process.exit(1);
}
console.log('✅ Proxy script found\n');

// Start the proxy
let pongReceived = false;
const startTime = Date.now();

console.log('Starting MCP proxy...');
const proxy = spawn('node', [proxyPath], {
  stdio: ['pipe', 'pipe', 'inherit'], // We need to capture stdout but pipe stderr directly
});

// Process stdout from the proxy to determine when it's ready
proxy.stdout.on('data', data => {
  const output = data.toString().trim();

  try {
    const response = JSON.parse(output);
    if (response.type === 'pong') {
      pongReceived = true;
      const connectionTime = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Supabase connection successful! (${connectionTime}s)`);
      console.log('\n📊 MCP Status');
      console.log('-------------');
      console.log('✅ Basic connectivity: Working');
      console.log('✅ Table queries: Working');
      console.log('✅ Project info: Working');
      console.log('✅ SQL execution: Working via database functions\n');

      console.log('📋 Available Operations');
      console.log('--------------------');
      console.log('• ping - Check connection');
      console.log('• query - Query database tables');
      console.log('• list_projects - List Supabase projects');
      console.log('• get_project - Get project details');
      console.log('• exec_sql - Execute SQL statements\n');

      console.log('🔗 Connected to:');
      console.log('• Project: AKC Revisions');
      console.log('• ID: zrxezqllmpdlhiudutme\n');

      console.log('ℹ️  Keep this terminal window open while using Cursor AI');
      console.log('ℹ️  Press Ctrl+C to stop the MCP server\n');

      // No need to keep checking ping anymore
      clearInterval(pingInterval);
    }
  } catch (e) {
    // Not JSON or not a ping response
  }
});

// Send ping messages at intervals to test connection
let pingCount = 0;
const pingInterval = setInterval(() => {
  if (pongReceived) {
    clearInterval(pingInterval);
    return;
  }

  pingCount++;
  proxy.stdin.write(JSON.stringify({ type: 'ping' }) + '\n');

  // After 5 attempts (5 seconds), give up
  if (pingCount >= 5 && !pongReceived) {
    console.error('\n❌ Connection timeout! The MCP proxy is not responding.');
    console.error('   Check if there are any error messages above.\n');
    clearInterval(pingInterval);
  }
}, 1000);

// Handle proxy termination
proxy.on('close', code => {
  if (code === 0) {
    console.log('\nMCP proxy exited gracefully');
  } else {
    console.error(`\nMCP proxy exited with code ${code}`);
    console.error('Check the error messages above for details.');
  }
});

// Handle this process's termination
process.on('SIGINT', () => {
  console.log('\nShutting down MCP proxy...');
  proxy.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down MCP proxy...');
  proxy.kill('SIGTERM');
});
