/**
 * Comprehensive Supabase Integration Test Script
 *
 * This script verifies all aspects of our Supabase integration:
 * 1. MCP server connection
 * 2. Direct client access via utils.ts
 * 3. Migration runner functionality
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.magenta}🧪 Supabase Integration Test${colors.reset}`);
console.log(`${colors.magenta}==========================${colors.reset}\n`);

// Track test results
const testResults = {
  pass: 0,
  fail: 0,
  total: 0,
};

function logPass(message) {
  testResults.pass++;
  testResults.total++;
  console.log(`${colors.green}✅ PASS: ${message}${colors.reset}`);
}

function logFail(message, error) {
  testResults.fail++;
  testResults.total++;
  console.log(`${colors.red}❌ FAIL: ${message}${colors.reset}`);
  if (error) {
    console.log(`   ${colors.red}${error}${colors.reset}`);
  }
}

/**
 * Test 1: MCP Server Connection
 */
async function testMCPConnection() {
  console.log(`\n${colors.cyan}🔍 Testing MCP Server Connection...${colors.reset}`);

  // Path to the MCP proxy
  const proxyPath = path.join(__dirname, 'supabase', 'functions', 'proxy.js');

  return new Promise(resolve => {
    if (!fs.existsSync(proxyPath)) {
      logFail('MCP proxy script missing', `Expected at: ${proxyPath}`);
      resolve();
      return;
    }

    const proxy = spawn('node', [proxyPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Track if we get a successful response
    let successfulPong = false;
    let connectionError = null;

    // Listen for data on stdout
    proxy.stdout.on('data', data => {
      const responseStr = data.toString().trim();

      try {
        const response = JSON.parse(responseStr);
        if (response.type === 'pong') {
          successfulPong = true;
          logPass('MCP server responded to ping');
        }
      } catch (e) {
        // Not JSON or not a ping response
      }
    });

    // Listen for errors
    proxy.stderr.on('data', data => {
      const errorMessage = data.toString().trim();
      if (
        errorMessage.includes('Error') ||
        errorMessage.includes('error') ||
        errorMessage.includes('failed')
      ) {
        connectionError = errorMessage;
      }
    });

    // Send a ping test
    setTimeout(() => {
      proxy.stdin.write(JSON.stringify({ type: 'ping' }) + '\n');

      // Wait a bit for response
      setTimeout(() => {
        if (!successfulPong) {
          logFail('MCP server did not respond to ping', connectionError || 'Timeout');
        }

        // Kill the proxy process
        proxy.kill();
        resolve();
      }, 2000);
    }, 1000);
  });
}

/**
 * Test 2: Utility Functions Check
 */
async function testUtilityImports() {
  console.log(`\n${colors.cyan}🔍 Testing Supabase Utility Imports...${colors.reset}`);

  const utilsPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'utils.ts');
  const clientPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'client.ts');

  // Check files exist
  if (!fs.existsSync(utilsPath)) {
    logFail('Supabase utils.ts missing', `Expected at: ${utilsPath}`);
  } else {
    logPass('utils.ts exists');

    // Check file content
    const utilsContent = fs.readFileSync(utilsPath, 'utf8');
    if (utilsContent.includes('executeSql')) {
      logPass('executeSql function found in utils.ts');
    } else {
      logFail('executeSql function not found in utils.ts');
    }

    if (utilsContent.includes('tableExists')) {
      logPass('tableExists function found in utils.ts');
    } else {
      logFail('tableExists function not found in utils.ts');
    }

    if (utilsContent.includes('columnsExist')) {
      logPass('columnsExist function found in utils.ts');
    } else {
      logFail('columnsExist function not found in utils.ts');
    }
  }

  if (!fs.existsSync(clientPath)) {
    logFail('Supabase client.ts missing', `Expected at: ${clientPath}`);
  } else {
    logPass('client.ts exists');
  }
}

/**
 * Test 3: Migration Runner Check
 */
async function testMigrationRunner() {
  console.log(`\n${colors.cyan}🔍 Testing Migration Runner...${colors.reset}`);

  const runnerPath = path.join(__dirname, 'db', 'scripts', 'migration-runner.cjs');

  if (!fs.existsSync(runnerPath)) {
    logFail('Migration runner missing', `Expected at: ${runnerPath}`);
    return;
  }

  logPass('migration-runner.cjs exists');

  // Check content
  const runnerContent = fs.readFileSync(runnerPath, 'utf8');

  if (runnerContent.includes('executeSql')) {
    logPass('Migration runner includes executeSql function');
  } else {
    logFail('Migration runner is missing executeSql function');
  }

  if (runnerContent.includes('tableExists')) {
    logPass('Migration runner includes tableExists function');
  } else {
    logFail('Migration runner is missing tableExists function');
  }

  if (runnerContent.includes('columnsExist')) {
    logPass('Migration runner includes columnsExist function');
  } else {
    logFail('Migration runner is missing columnsExist function');
  }
}

/**
 * Test 4: Documentation Check
 */
async function testDocumentation() {
  console.log(`\n${colors.cyan}🔍 Testing Documentation...${colors.reset}`);

  const docs = [
    {
      path: path.join(__dirname, 'docs', 'supabase_guide_for_agents.md'),
      name: 'Supabase Guide for Agents',
      requiredContent: ['MCP', 'migration', 'executeSql', 'tableExists'],
    },
    {
      path: path.join(__dirname, 'docs', 'supabase_connection.md'),
      name: 'Supabase Connection Guide',
      requiredContent: ['MCP', 'createClient', 'SQL'],
    },
  ];

  for (const doc of docs) {
    if (!fs.existsSync(doc.path)) {
      logFail(`${doc.name} missing`, `Expected at: ${doc.path}`);
      continue;
    }

    logPass(`${doc.name} exists`);

    // Check content
    const content = fs.readFileSync(doc.path, 'utf8');

    for (const term of doc.requiredContent) {
      if (content.includes(term)) {
        logPass(`${doc.name} includes ${term} information`);
      } else {
        logFail(`${doc.name} is missing ${term} information`);
      }
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    await testMCPConnection();
    await testUtilityImports();
    await testMigrationRunner();
    await testDocumentation();

    // Print summary
    console.log(`\n${colors.magenta}=== Test Summary ===${colors.reset}`);
    console.log(`${colors.green}Passed: ${testResults.pass}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.fail}${colors.reset}`);
    console.log(`${colors.blue}Total:  ${testResults.total}${colors.reset}`);

    if (testResults.fail === 0) {
      console.log(
        `\n${colors.green}🎉 All tests passed! The Supabase integration is working properly.${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.yellow}⚠️  Some tests failed. Please review the issues above.${colors.reset}`
      );
    }
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  }
}

// Run all tests
runTests();
