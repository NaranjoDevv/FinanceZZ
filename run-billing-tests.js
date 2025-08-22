#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Billing Limits
 * 
 * This script runs all billing-related tests and generates detailed reports
 * with random data generation and error debugging capabilities.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createTestReport() {
  const reportData = {
    timestamp: new Date().toISOString(),
    testSuites: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    },
    randomDataGenerated: {
      transactions: [],
      debts: [],
      categories: []
    },
    errors: [],
    performance: {}
  };

  return reportData;
}

function generateRandomTestData() {
  log('🎲 Generating random test data...', 'cyan');
  
  // Generate random transactions
  const transactions = [];
  for (let i = 0; i < 15; i++) { // Generate 15 to test limit overflow
    transactions.push({
      id: i + 1,
      description: `Test Transaction ${i + 1}: ${getRandomDescription()}`,
      amount: getRandomAmount(),
      type: Math.random() > 0.5 ? 'income' : 'expense',
      date: getRandomDate()
    });
  }

  // Generate random debts
  const debts = [];
  for (let i = 0; i < 3; i++) { // Generate 3 to test limit overflow
    debts.push({
      id: i + 1,
      counterpartyName: getRandomCounterpartyName(),
      amount: getRandomAmount(),
      description: `Test Debt ${i + 1}: ${getRandomDescription()}`,
      type: Math.random() > 0.5 ? 'owes_me' : 'i_owe'
    });
  }

  // Generate random categories
  const categories = [];
  for (let i = 0; i < 5; i++) { // Generate 5 to test limit overflow
    categories.push({
      id: i + 1,
      name: `Test Category ${i + 1}`,
      isExpense: Math.random() > 0.5,
      color: getRandomColor()
    });
  }

  const testData = { transactions, debts, categories };
  
  // Save test data to file
  fs.writeFileSync(
    path.join(__dirname, 'generated-test-data.json'),
    JSON.stringify(testData, null, 2)
  );
  
  log(`✅ Generated ${transactions.length} transactions, ${debts.length} debts, ${categories.length} categories`, 'green');
  return testData;
}

function getRandomDescription() {
  const descriptions = [
    'Compra de supermercado', 'Pago de servicios', 'Salario mensual', 'Freelance work',
    'Cena en restaurante', 'Gasolina', 'Medicamentos', 'Ropa nueva',
    'Suscripción Netflix', 'Uber', 'Amazon compra', 'Ingreso extra',
    'Factura electricidad', 'Internet', 'Teléfono móvil', 'Seguro auto'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomAmount() {
  return Math.floor(Math.random() * 999000) + 1000;
}

function getRandomCounterpartyName() {
  const names = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Luis Rodríguez', 'Sofia Hernández', 'Miguel Torres', 'Laura Sánchez'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomDate() {
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  return colors[Math.floor(Math.random() * colors.length)];
}

async function runTestSuite(suiteName, command) {
  log(`\n🧪 Running ${suiteName}...`, 'blue');
  
  const startTime = Date.now();
  let result = { success: false, output: '', error: '' };
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    result.success = true;
    result.output = output;
    log(`✅ ${suiteName} completed successfully`, 'green');
    
  } catch (error) {
    result.success = false;
    result.error = error.message;
    result.output = error.stdout || '';
    log(`❌ ${suiteName} failed: ${error.message}`, 'red');
  }
  
  const duration = Date.now() - startTime;
  log(`⏱️  Duration: ${duration}ms`, 'yellow');
  
  return { ...result, duration, suiteName };
}

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check if Next.js dev server is running
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      log('✅ Next.js dev server is running', 'green');
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    log('❌ Next.js dev server is not running. Please start it with: npm run dev', 'red');
    log('Starting dev server...', 'yellow');
    
    // Try to start dev server
    try {
      execSync('npm run dev &', { stdio: 'inherit' });
      log('⏱️  Waiting for server to start...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    } catch (error) {
      log('❌ Failed to start dev server automatically', 'red');
      process.exit(1);
    }
  }
  
  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    log('✅ Playwright is installed', 'green');
  } catch (error) {
    log('❌ Playwright is not installed. Installing...', 'yellow');
    try {
      execSync('npx playwright install', { stdio: 'inherit' });
      log('✅ Playwright installed successfully', 'green');
    } catch (installError) {
      log('❌ Failed to install Playwright', 'red');
      process.exit(1);
    }
  }
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    log('✅ Created screenshots directory', 'green');
  }
}

async function main() {
  log('🚀 Starting Comprehensive Billing Limits Test Suite', 'bright');
  log('=' .repeat(60), 'cyan');
  
  const report = createTestReport();
  const startTime = Date.now();
  
  try {
    // Check prerequisites
    await checkPrerequisites();
    
    // Generate random test data
    const testData = generateRandomTestData();
    report.randomDataGenerated = testData;
    
    // Define test suites to run
    const testSuites = [
      {
        name: 'Billing Limits Tests',
        command: 'npx playwright test billing-limits.spec.ts --reporter=json'
      },
      {
        name: 'Debug Scenarios Tests',
        command: 'npx playwright test debug-scenarios.spec.ts --reporter=json'
      },
      {
        name: 'Full Test Suite with UI',
        command: 'npx playwright test --headed --reporter=html'
      }
    ];
    
    // Run each test suite
    for (const suite of testSuites) {
      const result = await runTestSuite(suite.name, suite.command);
      report.testSuites.push(result);
      
      if (result.success) {
        report.summary.passed++;
      } else {
        report.summary.failed++;
        report.errors.push({
          suite: suite.name,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
      report.summary.total++;
    }
    
    // Generate performance report
    log('\n📊 Generating performance report...', 'cyan');
    report.summary.duration = Date.now() - startTime;
    report.performance = {
      totalDuration: report.summary.duration,
      averageTestDuration: report.testSuites.reduce((sum, suite) => sum + suite.duration, 0) / report.testSuites.length,
      fastestTest: Math.min(...report.testSuites.map(suite => suite.duration)),
      slowestTest: Math.max(...report.testSuites.map(suite => suite.duration))
    };
    
    // Save comprehensive report
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    log('\n' + '=' .repeat(60), 'cyan');
    log('📋 TEST SUMMARY', 'bright');
    log('=' .repeat(60), 'cyan');
    log(`Total Tests: ${report.summary.total}`, 'blue');
    log(`Passed: ${report.summary.passed}`, 'green');
    log(`Failed: ${report.summary.failed}`, 'red');
    log(`Duration: ${report.summary.duration}ms`, 'yellow');
    log(`Report saved to: ${reportPath}`, 'magenta');
    
    if (report.errors.length > 0) {
      log('\n❌ ERRORS FOUND:', 'red');
      report.errors.forEach((error, index) => {
        log(`${index + 1}. ${error.suite}: ${error.error}`, 'red');
      });
    }
    
    log('\n🎯 NEXT STEPS:', 'cyan');
    log('1. Review the generated test report for detailed results', 'blue');
    log('2. Check screenshots in tests/screenshots/ for visual verification', 'blue');
    log('3. Run specific tests with: npm run test:billing or npm run test:debug-scenarios', 'blue');
    log('4. Open UI mode with: npm run test:ui for interactive debugging', 'blue');
    
    // Open HTML report if generated
    try {
      execSync('npx playwright show-report', { stdio: 'inherit' });
    } catch (error) {
      log('Note: HTML report not available. Run npm run test:report to view it.', 'yellow');
    }
    
  } catch (error) {
    log(`💥 Fatal error: ${error.message}`, 'red');
    report.errors.push({
      suite: 'Main Runner',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
  
  log('\n🏁 Test suite completed!', 'green');
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Test suite interrupted by user', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`💥 Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});