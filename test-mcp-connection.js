// Test MCP Connection
// Simple test to check if MCP server can be started and respond to a ping

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the MCP proxy
const proxyPath = path.join(__dirname, 'supabase', 'functions', 'proxy.js');

console.log('MCP Connection Test');
console.log('------------------');
console.log('1. Checking if proxy script exists at:', proxyPath);

if (!fs.existsSync(proxyPath)) {
  console.error('❌ FAILED: Proxy script not found!');
  process.exit(1);
} else {
  console.log('✅ PASSED: Proxy script found');
}

console.log('2. Checking if .cursor/mcp.json exists...');
const mcpConfigPath = path.join(__dirname, '.cursor', 'mcp.json');

if (!fs.existsSync(mcpConfigPath)) {
  console.error('❌ FAILED: MCP configuration not found at', mcpConfigPath);
  process.exit(1);
} else {
  console.log('✅ PASSED: MCP configuration found');

  try {
    const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    console.log('   Configuration:', JSON.stringify(config, null, 2));

    if (!config.mcpServers || !config.mcpServers.supabase) {
      console.error('❌ FAILED: Invalid MCP configuration. Missing supabase server config.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ FAILED: Error parsing MCP configuration:', err.message);
    process.exit(1);
  }
}

console.log('3. Starting MCP proxy for testing...');

// Start the proxy with piped stdio for testing
const proxy = spawn('node', [proxyPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Track if we received a pong response
let receivedPong = false;

// Collect proxy stderr output
let stderrOutput = '';
proxy.stderr.on('data', data => {
  const output = data.toString();
  stderrOutput += output;
  console.log('   [Proxy stderr]:', output.trim());
});

// Process stdout from the proxy
proxy.stdout.on('data', data => {
  const output = data.toString().trim();
  console.log('   [Proxy stdout]:', output);

  try {
    const response = JSON.parse(output);
    if (response.type === 'pong') {
      console.log('✅ PASSED: Received pong response from MCP server!');
      receivedPong = true;

      // Test successful, terminate proxy
      setTimeout(() => {
        proxy.kill();
      }, 500);
    }
  } catch (err) {
    // Not JSON or not a pong
  }
});

// Send ping after brief delay to allow proxy to initialize
setTimeout(() => {
  console.log('   Sending ping to MCP server...');
  proxy.stdin.write(JSON.stringify({ type: 'ping' }) + '\n');
}, 1000);

// Set timeout to kill proxy if no pong received
const timeout = setTimeout(() => {
  if (!receivedPong) {
    console.error('❌ FAILED: No response received from MCP server within timeout period.');
    proxy.kill();
  }
}, 5000);

// Handle proxy exit
proxy.on('close', code => {
  clearTimeout(timeout);

  if (receivedPong) {
    console.log('✅ TEST COMPLETE: MCP proxy is working correctly!');
    console.log('');
    console.log('To start the MCP server for use with Cursor:');
    console.log('1. Run: node start-mcp.js');
    console.log('2. Keep the terminal window open while using Cursor');
    process.exit(0);
  } else {
    console.error('❌ FAILED: MCP proxy exited with code', code);
    console.error('');
    console.error('Possible issues:');
    console.error('1. The @supabase/supabase-js package might not be installed.');
    console.error('   Try running: npm install @supabase/supabase-js');
    console.error('2. The Supabase credentials might be invalid.');
    console.error('');
    console.error('Full stderr output:');
    console.error(stderrOutput || '(none)');
    process.exit(1);
  }
});
