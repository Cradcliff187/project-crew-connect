#!/usr/bin/env node

/**
 * System Validation Script
 * Tests basic functionality, routes, and API endpoints
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const RESULTS_FILE = 'validation-results.json';

class SystemValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  async runValidation() {
    console.log('🔧 Starting System Validation...\n');

    // Test basic server connectivity
    await this.testServerConnectivity();

    // Test main routes
    await this.testMainRoutes();

    // Test API endpoints
    await this.testApiEndpoints();

    // Generate report
    this.generateReport();

    console.log('\n✅ System Validation Complete!');
    console.log(
      `📊 Results: ${this.results.summary.passed}/${this.results.summary.total} tests passed`
    );

    if (this.results.summary.failed > 0) {
      console.log(`❌ ${this.results.summary.failed} tests failed`);
      process.exit(1);
    }
  }

  async testServerConnectivity() {
    console.log('🌐 Testing Server Connectivity...');

    try {
      const response = await this.makeRequest('/');
      this.addResult('Server Connectivity', 'PASS', 'Server is responding', {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
      });
    } catch (error) {
      this.addResult('Server Connectivity', 'FAIL', `Server not responding: ${error.message}`);
    }
  }

  async testMainRoutes() {
    console.log('🧭 Testing Main Routes...');

    const routes = [
      '/',
      '/projects',
      '/work-orders',
      '/estimates',
      '/contacts',
      '/employees',
      '/vendors',
      '/subcontractors',
      '/documents',
      '/reports',
      '/admin/time-entries',
      '/field-dashboard',
    ];

    for (const route of routes) {
      try {
        const response = await this.makeRequest(route);

        if (response.statusCode === 200) {
          this.addResult(`Route: ${route}`, 'PASS', 'Route accessible', {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
          });
        } else if (response.statusCode === 401 || response.statusCode === 403) {
          this.addResult(`Route: ${route}`, 'WARNING', 'Route requires authentication', {
            statusCode: response.statusCode,
          });
        } else {
          this.addResult(
            `Route: ${route}`,
            'FAIL',
            `Unexpected status code: ${response.statusCode}`
          );
        }
      } catch (error) {
        this.addResult(`Route: ${route}`, 'FAIL', `Route error: ${error.message}`);
      }
    }
  }

  async testApiEndpoints() {
    console.log('🔌 Testing API Endpoints...');

    const apiEndpoints = [
      '/api/projects',
      '/api/work-orders',
      '/api/estimates',
      '/api/contacts',
      '/api/employees',
      '/api/vendors',
      '/api/subcontractors',
      '/api/documents',
      '/api/time-entries',
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await this.makeRequest(endpoint);

        if (response.statusCode === 200) {
          this.addResult(`API: ${endpoint}`, 'PASS', 'API endpoint accessible', {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
          });
        } else if (response.statusCode === 401 || response.statusCode === 403) {
          this.addResult(`API: ${endpoint}`, 'WARNING', 'API requires authentication', {
            statusCode: response.statusCode,
          });
        } else {
          this.addResult(
            `API: ${endpoint}`,
            'FAIL',
            `Unexpected status code: ${response.statusCode}`
          );
        }
      } catch (error) {
        this.addResult(`API: ${endpoint}`, 'FAIL', `API error: ${error.message}`);
      }
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = `${BASE_URL}${path}`;

      const req = http.get(url, res => {
        const responseTime = Date.now() - startTime;

        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: responseTime,
          });
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  addResult(testName, status, message, details = {}) {
    const result = {
      test: testName,
      status: status,
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
    };

    this.results.tests.push(result);
    this.results.summary.total++;

    switch (status) {
      case 'PASS':
        this.results.summary.passed++;
        console.log(`  ✅ ${testName}: ${message}`);
        break;
      case 'FAIL':
        this.results.summary.failed++;
        console.log(`  ❌ ${testName}: ${message}`);
        break;
      case 'WARNING':
        this.results.summary.warnings++;
        console.log(`  ⚠️  ${testName}: ${message}`);
        break;
    }
  }

  generateReport() {
    // Save detailed results to JSON file
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync('VALIDATION_RESULTS.md', markdownReport);

    console.log(`\n📄 Detailed results saved to: ${RESULTS_FILE}`);
    console.log(`📄 Markdown report saved to: VALIDATION_RESULTS.md`);
  }

  generateMarkdownReport() {
    const { summary, tests } = this.results;

    let markdown = `# 🔧 System Validation Results\n\n`;
    markdown += `**Date:** ${new Date(this.results.timestamp).toLocaleString()}\n`;
    markdown += `**Base URL:** ${this.results.baseUrl}\n\n`;

    markdown += `## 📊 Summary\n\n`;
    markdown += `| Status | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| ✅ Passed | ${summary.passed} |\n`;
    markdown += `| ❌ Failed | ${summary.failed} |\n`;
    markdown += `| ⚠️ Warnings | ${summary.warnings} |\n`;
    markdown += `| **Total** | **${summary.total}** |\n\n`;

    markdown += `## 📋 Test Results\n\n`;

    const groupedTests = tests.reduce((groups, test) => {
      const category = test.test.includes('Route:')
        ? 'Routes'
        : test.test.includes('API:')
          ? 'API Endpoints'
          : 'General';

      if (!groups[category]) groups[category] = [];
      groups[category].push(test);
      return groups;
    }, {});

    Object.entries(groupedTests).forEach(([category, categoryTests]) => {
      markdown += `### ${category}\n\n`;
      markdown += `| Test | Status | Message | Details |\n`;
      markdown += `|------|--------|---------|----------|\n`;

      categoryTests.forEach(test => {
        const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        const details = test.details.statusCode ? `Status: ${test.details.statusCode}` : '';

        markdown += `| ${test.test.replace(/^(Route:|API:)\s*/, '')} | ${statusIcon} ${test.status} | ${test.message} | ${details} |\n`;
      });

      markdown += `\n`;
    });

    return markdown;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SystemValidator();
  validator.runValidation().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = SystemValidator;
