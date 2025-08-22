#!/usr/bin/env node

/**
 * Manual Billing Limits Testing Guide
 * 
 * This script provides step-by-step instructions for manually testing
 * billing limits after authentication.
 */

const { execSync } = require('child_process');

console.log(`
🧪 MANUAL BILLING LIMITS TESTING GUIDE
=====================================

This guide will help you manually test the billing limits functionality
after completing authentication.

PREREQUISITES:
✅ Next.js dev server running (npm run dev)
✅ User account created and logged in
✅ Access to transactions page

STEP 1: AUTHENTICATION
----------------------
1. Navigate to http://localhost:3000
2. Click "COMENZAR AHORA" button
3. Complete sign-in using:
   - GitHub OAuth, OR
   - Google OAuth, OR  
   - Email: naranjoalejandro96@gmail.com
   - Password: Alejin2092
4. Ensure you reach the dashboard

STEP 2: TRANSACTION LIMIT TESTING (10 transactions)
--------------------------------------------------
1. Navigate to /transactions page
2. Look for "Nueva" or "Agregar" button
3. Create transactions with this test data:

`);

// Generate test data for manual testing
const testTransactions = [];
for (let i = 1; i <= 12; i++) {
    const descriptions = [
        'Compra de supermercado', 'Pago de servicios', 'Salario mensual', 'Freelance work',
        'Cena en restaurante', 'Gasolina', 'Medicamentos', 'Ropa nueva',
        'Suscripción Netflix', 'Uber', 'Amazon compra', 'Ingreso extra'
    ];
    
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const amount = Math.floor(Math.random() * 999000) + 1000;
    const type = Math.random() > 0.5 ? 'income' : 'expense';
    
    testTransactions.push({ id: i, description, amount, type });
    console.log(`   Transaction ${i}: ${description} - $${amount.toLocaleString()} (${type})`);
}

console.log(`

EXPECTED BEHAVIOR:
- First 10 transactions should be created successfully
- 11th transaction should trigger billing limit popup
- Popup should mention "subscription" or "premium" plan

STEP 3: DEBT LIMIT TESTING (1 debt)
----------------------------------
1. Navigate to /debts page
2. Look for "Nueva Deuda" or "Agregar" button
3. Create debts with this test data:

   Debt 1: Juan Pérez owes me $150,000
   Debt 2: María García - I owe $200,000

EXPECTED BEHAVIOR:
- First debt should be created successfully
- Second debt should trigger billing limit popup

STEP 4: CATEGORY LIMIT TESTING (2 categories)
--------------------------------------------
1. Navigate to /categories or /settings page
2. Look for "Nueva Categoría" button
3. Create categories:

   Category 1: Alimentación (Expense)
   Category 2: Transporte (Expense)  
   Category 3: Entretenimiento (Expense)

EXPECTED BEHAVIOR:
- First 2 categories should be created successfully
- 3rd category should trigger billing limit popup

STEP 5: RECURRING TRANSACTION TESTING (2 recurring)
--------------------------------------------------
1. Navigate to /transactions page
2. Create new transaction with "Recurring" option enabled
3. Try to create up to 3 recurring transactions

EXPECTED BEHAVIOR:
- First 2 recurring transactions should be created successfully
- 3rd recurring transaction should trigger billing limit popup

TROUBLESHOOTING:
--------------
❌ "No new transaction button found"
   → Make sure you're authenticated and on the correct page
   → Try refreshing the page
   → Check if button text is in Spanish: "Nueva", "Agregar", "Crear"

❌ "Form won't submit"
   → Ensure all required fields are filled
   → Check for validation errors
   → Try pressing Enter instead of clicking submit

❌ "No billing limit popup"
   → Verify you're testing with a FREE account (not premium)
   → Check browser console for errors
   → Ensure you've reached the actual limit (10 transactions, 1 debt, etc.)

VERIFICATION CHECKLIST:
---------------------
□ User can create up to 10 transactions
□ 11th transaction shows subscription popup
□ User can create 1 debt
□ 2nd debt shows subscription popup  
□ User can create 2 categories
□ 3rd category shows subscription popup
□ User can create 2 recurring transactions
□ 3rd recurring transaction shows subscription popup
□ Subscription popup mentions premium/upgrade options
□ Billing limits are enforced consistently

AUTOMATED TESTING AFTER MANUAL AUTH:
-----------------------------------
Once authenticated, you can run these automated tests:

`);

console.log(`
# Run rapid transaction creation test
npx playwright test complete-billing-test.spec.ts --headed

# Run comprehensive billing limits test  
npx playwright test billing-limits-working.spec.ts --headed

# Generate test report
node run-billing-tests.js

REPORTING ISSUES:
---------------
If you find any issues during testing, please capture:
1. Screenshots of billing limit popups (or lack thereof)
2. Browser console errors
3. Network request/response data
4. Exact steps to reproduce the issue

The test framework is ready to automatically verify these limits
once authentication is properly handled!

Good luck testing! 🚀
`);

// Optional: Run a quick test to verify environment
try {
    console.log('\n🔍 ENVIRONMENT CHECK:');
    
    // Check if dev server is running
    const { execSync } = require('child_process');
    try {
        execSync('curl -s http://localhost:3000', { timeout: 5000 });
        console.log('✅ Dev server is running');
    } catch (e) {
        console.log('❌ Dev server not running - please start with: npm run dev');
    }
    
    // Check if Playwright is available
    try {
        execSync('npx playwright --version', { stdio: 'pipe' });
        console.log('✅ Playwright is available');
    } catch (e) {
        console.log('❌ Playwright not installed - run: npx playwright install');
    }
    
    console.log('✅ Manual testing guide ready!');
    
} catch (error) {
    console.log('Environment check completed with warnings.');
}