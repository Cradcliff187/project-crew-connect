#!/usr/bin/env node

/**
 * System Validation Script
 * Tests basic functionality, routes, and API endpoints
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';

const FRONTEND_URL = 'http://localhost:8080';
const BACKEND_URL = 'http://localhost:3000';
const RESULTS_FILE = 'validation-results.json';

class SystemValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      frontendUrl: FRONTEND_URL,
      backendUrl: BACKEND_URL,
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

    // Test frontend server connectivity
    await this.testFrontendConnectivity();

    // Test backend server connectivity
    await this.testBackendConnectivity();

    // Test main frontend routes
    await this.testFrontendRoutes();

    // Test backend API endpoints
    await this.testBackendApiEndpoints();

    // Generate report
    this.generateReport();

    console.log('\n✅ System Validation Complete!');
    console.log(
      `📊 Results: ${this.results.summary.passed}/${this.results.summary.total} tests passed`
    );

    if (this.results.summary.failed > 0) {
      console.log(`❌ ${this.results.summary.failed} tests failed`);
      console.log(`⚠️ ${this.results.summary.warnings} warnings`);
    }
  }

  async testFrontendConnectivity() {
    console.log('🌐 Testing Frontend Server Connectivity...');

    try {
      const response = await this.makeRequest(FRONTEND_URL, '/');
      this.addResult('Frontend Server Connectivity', 'PASS', 'Frontend server is responding', {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
      });
    } catch (error) {
      this.addResult(
        'Frontend Server Connectivity',
        'FAIL',
        `Frontend server not responding: ${error.message}`
      );
    }
  }

  async testBackendConnectivity() {
    console.log('🔌 Testing Backend Server Connectivity...');

    try {
      const response = await this.makeRequest(BACKEND_URL, '/api/auth/status');
      this.addResult('Backend Server Connectivity', 'PASS', 'Backend server is responding', {
        statusCode: response.statusCode,
        responseTime: response.responseTime,
      });
    } catch (error) {
      this.addResult(
        'Backend Server Connectivity',
        'FAIL',
        `Backend server not responding: ${error.message}`
      );
    }
  }

  async testFrontendRoutes() {
    console.log('🧭 Testing Frontend Routes...');

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
        const response = await this.makeRequest(FRONTEND_URL, route);

        if (response.statusCode === 200) {
          this.addResult(`Frontend Route: ${route}`, 'PASS', 'Route accessible', {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
          });
        } else if (response.statusCode === 401 || response.statusCode === 403) {
          this.addResult(`Frontend Route: ${route}`, 'WARNING', 'Route requires authentication', {
            statusCode: response.statusCode,
          });
        } else {
          this.addResult(
            `Frontend Route: ${route}`,
            'FAIL',
            `Unexpected status code: ${response.statusCode}`
          );
        }
      } catch (error) {
        this.addResult(`Frontend Route: ${route}`, 'FAIL', `Route error: ${error.message}`);
      }
    }
  }

  async testBackendApiEndpoints() {
    console.log('🔌 Testing Backend API Endpoints...');

    const apiEndpoints = [
      // Auth endpoints
      '/api/auth/status',

      // Google API test endpoints
      '/test/drive',
      '/test/calendar',
      '/test/gmail',

      // Maps API
      '/api/maps/placedetails?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',

      // Calendar API
      '/api/calendar/events',
      '/api/calendar/list',

      // Data API endpoints (require auth)
      '/api/projects',
      '/api/work-orders',

      // Email lookup
      '/api/assignees/employee/1/email',

      // OCR endpoint
      '/api/ocr/process-receipt',
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await this.makeRequest(BACKEND_URL, endpoint);

        if (response.statusCode === 200) {
          this.addResult(`Backend API: ${endpoint}`, 'PASS', 'API endpoint accessible', {
            statusCode: response.statusCode,
            responseTime: response.responseTime,
          });
        } else if (response.statusCode === 401 || response.statusCode === 403) {
          this.addResult(`Backend API: ${endpoint}`, 'WARNING', 'API requires authentication', {
            statusCode: response.statusCode,
          });
        } else if (response.statusCode === 400) {
          this.addResult(`Backend API: ${endpoint}`, 'WARNING', 'API requires parameters', {
            statusCode: response.statusCode,
          });
        } else if (response.statusCode === 404) {
          this.addResult(`Backend API: ${endpoint}`, 'FAIL', 'API endpoint not found', {
            statusCode: response.statusCode,
          });
        } else {
          this.addResult(
            `Backend API: ${endpoint}`,
            'FAIL',
            `Unexpected status code: ${response.statusCode}`
          );
        }
      } catch (error) {
        this.addResult(`Backend API: ${endpoint}`, 'FAIL', `API error: ${error.message}`);
      }
    }
  }

  makeRequest(baseUrl, path) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const url = `${baseUrl}${path}`;

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
    markdown += `**Frontend URL:** ${this.results.frontendUrl}\n`;
    markdown += `**Backend URL:** ${this.results.backendUrl}\n\n`;

    markdown += `## 📊 Summary\n\n`;
    markdown += `| Status | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| ✅ Passed | ${summary.passed} |\n`;
    markdown += `| ❌ Failed | ${summary.failed} |\n`;
    markdown += `| ⚠️ Warnings | ${summary.warnings} |\n`;
    markdown += `| **Total** | **${summary.total}** |\n\n`;

    markdown += `## 📋 Test Results\n\n`;

    const groupedTests = tests.reduce((groups, test) => {
      const category = test.test.includes('Frontend Route:')
        ? 'Frontend Routes'
        : test.test.includes('Backend API:')
          ? 'Backend API Endpoints'
          : test.test.includes('Frontend Server')
            ? 'Frontend Server'
            : test.test.includes('Backend Server')
              ? 'Backend Server'
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
        const testName = test.test.replace(
          /^(Frontend Route:|Backend API:|Frontend Server |Backend Server )\s*/,
          ''
        );

        markdown += `| ${testName} | ${statusIcon} ${test.status} | ${test.message} | ${details} |\n`;
      });

      markdown += `\n`;
    });

    return markdown;
  }
}

// Run validation
const validator = new SystemValidator();
validator.runValidation().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
