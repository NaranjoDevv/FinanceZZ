import { test, expect } from '@playwright/test';
import { TestDataGenerator, getErrorMessage } from './utils/test-helpers';

test.describe('Billing Limits Testing', () => {
  
  test('Should access transactions page and analyze elements', async ({ page }) => {
    console.log('📊 Testing transactions page access...');
    
    // Try to access transactions directly (will redirect to auth if needed)
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');
    
    await page.screenshot({ 
      path: 'tests/screenshots/billing-01-transactions-page.png', 
      fullPage: true 
    });
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in')) {
      console.log('📝 Redirected to sign-in, analyzing login form...');
      
      // Count form elements
      const inputs = await page.locator('input').count();
      const buttons = await page.locator('button').count();
      
      console.log(`Sign-in page has ${inputs} inputs and ${buttons} buttons`);
      
      // Log button texts
      const buttonTexts = await page.locator('button').allTextContents();
      console.log('Available buttons:', buttonTexts);
      
    } else if (currentUrl.includes('transactions')) {
      console.log('📊 Successfully accessed transactions page!');
      
      // Analyze the transactions page
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      
      console.log(`Page has ${buttons} buttons and ${links} links`);
      
      // Log button texts
      const buttonTexts = await page.locator('button').allTextContents();
      console.log('Button texts:', buttonTexts.filter(text => text.trim().length > 0));
    }
  });

  test('Should generate random test data', async ({ page }) => {
    console.log('🎲 Testing random data generation...');
    
    // Generate random transaction data
    const testTransactions = [];
    for (let i = 0; i < 12; i++) { // Generate 12 to test the 10-transaction limit
      testTransactions.push({
        id: i + 1,
        description: TestDataGenerator.randomDescription(),
        amount: TestDataGenerator.randomAmount(),
        type: Math.random() > 0.5 ? 'income' : 'expense',
        date: TestDataGenerator.randomDate()
      });
    }
    
    console.log('Generated test transactions:');
    testTransactions.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.description} - $${transaction.amount} (${transaction.type})`);
    });
    
    // Generate random debts
    const testDebts = [];
    for (let i = 0; i < 3; i++) { // Generate 3 to test the 1-debt limit
      testDebts.push({
        id: i + 1,
        counterpartyName: TestDataGenerator.randomCounterpartyName(),
        amount: TestDataGenerator.randomAmount(),
        description: `Test Debt ${i + 1}: ${TestDataGenerator.randomDescription()}`,
        type: Math.random() > 0.5 ? 'owes_me' : 'i_owe'
      });
    }
    
    console.log('Generated test debts:');
    testDebts.forEach((debt, index) => {
      console.log(`${index + 1}. ${debt.counterpartyName} - $${debt.amount} (${debt.type})`);
    });
    
    // Save test data
    await page.goto('/');
    await page.screenshot({ 
      path: 'tests/screenshots/billing-02-random-data-generated.png', 
      fullPage: true 
    });
    
    console.log('✅ Random test data generated successfully');
  });

  test('Should look for new transaction button and modal', async ({ page }) => {
    console.log('🔍 Looking for new transaction functionality...');
    
    // Go to transactions page
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');
    
    await page.screenshot({ 
      path: 'tests/screenshots/billing-03-looking-for-button.png', 
      fullPage: true 
    });
    
    // Look for "Nueva" or "Add" buttons
    const buttonSelectors = [
      'button:has-text("Nueva")',
      'button:has-text("Agregar")',
      'button:has-text("Crear")',
      'button:has-text("Add")',
      'button:has-text("+")',
      '.brutal-button'
    ];
    
    let newTransactionButton = null;
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          newTransactionButton = button;
          console.log(`✅ Found "New Transaction" button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} not found`);
      }
    }
    
    if (newTransactionButton) {
      console.log('🎯 Attempting to click new transaction button...');
      await newTransactionButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/billing-04-modal-opened.png', 
        fullPage: true 
      });
      
      // Check if modal/form opened
      const modalSelectors = [
        '.modal',
        '.brutal-modal',
        '[role="dialog"]',
        '[aria-modal="true"]',
        'form'
      ];
      
      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          const modal = page.locator(selector).first();
          if (await modal.isVisible()) {
            modalFound = true;
            console.log(`✅ Modal/form found with selector: ${selector}`);
            
            // Analyze form fields
            const inputs = await modal.locator('input').count();
            const textareas = await modal.locator('textarea').count();
            const selects = await modal.locator('select').count();
            
            console.log(`Modal has ${inputs} inputs, ${textareas} textareas, ${selects} selects`);
            
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!modalFound) {
        console.log('⚠️ No modal or form detected after button click');
        
        // Check if page changed
        const newUrl = page.url();
        console.log(`URL after click: ${newUrl}`);
      }
    } else {
      console.log('⚠️ No "New Transaction" button found');
      
      // List all buttons available
      const allButtons = await page.locator('button').allTextContents();
      console.log('All available buttons:', allButtons.filter(text => text.trim().length > 0));
    }
  });

  test('Should attempt form filling with random data', async ({ page }) => {
    console.log('📝 Attempting to fill forms with random data...');
    
    // Navigate to transactions
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');
    
    // Generate test data
    const testData = {
      description: TestDataGenerator.randomDescription(),
      amount: TestDataGenerator.randomAmount()
    };
    
    console.log(`Test data: ${testData.description} - $${testData.amount}`);
    
    // Look for new transaction button
    const button = page.locator('button:has-text("Nueva"), button:has-text("Agregar"), button:has-text("+")').first();
    
    try {
      if (await button.isVisible({ timeout: 5000 })) {
        await button.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/billing-05-form-attempt.png', 
          fullPage: true 
        });
        
        // Try to fill form quickly
        const textInput = page.locator('input[type="text"], input:not([type="number"]):not([type="email"]):not([type="password"])').first();
        const numberInput = page.locator('input[type="number"]').first();
        
        if (await textInput.isVisible({ timeout: 3000 })) {
          await textInput.fill(testData.description);
          console.log('✅ Description filled');
        }
        
        if (await numberInput.isVisible({ timeout: 3000 })) {
          await numberInput.fill(testData.amount.toString());
          console.log('✅ Amount filled');
        }
        
        // Try to submit
        const submitBtn = page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")').first();
        if (await submitBtn.isVisible({ timeout: 2000 })) {
          await submitBtn.click();
          console.log('✅ Form submitted');
          
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: 'tests/screenshots/billing-06-after-submit.png', 
            fullPage: true 
          });
          
          // Check for any error messages or success messages
          const messageSelectors = [
            '.error',
            '.success',
            '.brutal-popup',
            '[role="alert"]',
            'div:has-text("límite")',
            'div:has-text("subscription")',
            'div:has-text("premium")',
            'div:has-text("created")',
            'div:has-text("creado")'
          ];
          
          for (const selector of messageSelectors) {
            try {
              const message = page.locator(selector).first();
              if (await message.isVisible({ timeout: 2000 })) {
                const messageText = await message.textContent();
                console.log(`📢 Message detected: ${messageText}`);
              }
            } catch (e) {
              continue;
            }
          }
        }
      } else {
        console.log('⚠️ New transaction button not found');
      }
    } catch (error) {
      console.log(`❌ Error during form filling:`, getErrorMessage(error));
    }
  });

  test('Should test multiple rapid transactions to test limits', async ({ page }) => {
    console.log('🚀 Testing rapid transaction creation to hit limits...');
    
    // Navigate to transactions
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');
    
    const maxAttempts = 15; // Try to create 15 transactions (should hit 10-transaction limit)
    let successfulTransactions = 0;
    let limitHit = false;
    
    for (let i = 1; i <= maxAttempts && !limitHit; i++) {
      console.log(`Attempt ${i}/${maxAttempts}: Creating transaction...`);
      
      const testData = {
        description: `Limit Test ${i}: ${TestDataGenerator.randomDescription()}`,
        amount: TestDataGenerator.randomAmount()
      };
      
      try {
        // Look for new transaction button
        const button = page.locator('button:has-text("Nueva"), button:has-text("Agregar")').first();
        
        if (await button.isVisible({ timeout: 3000 })) {
          await button.click();
          await page.waitForTimeout(1500);
          
          // Quick form fill
          const textInput = page.locator('input[type="text"], textarea').first();
          const numberInput = page.locator('input[type="number"]').first();
          
          if (await textInput.isVisible({ timeout: 2000 })) {
            await textInput.fill(testData.description);
          }
          
          if (await numberInput.isVisible({ timeout: 2000 })) {
            await numberInput.fill(testData.amount.toString());
          }
          
          // Submit
          const submitBtn = page.locator('button[type="submit"], button:has-text("Crear")').first();
          if (await submitBtn.isVisible({ timeout: 2000 })) {
            await submitBtn.click();
            await page.waitForTimeout(2000);
            
            // Check for limit-related messages
            const limitSelectors = [
              'div:has-text("límite")',
              'div:has-text("limit")',
              'div:has-text("subscription")',
              'div:has-text("premium")',
              'div:has-text("upgrade")',
              '.error:has-text("10")'
            ];
            
            let limitMessage = false;
            for (const selector of limitSelectors) {
              try {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 })) {
                  const text = await element.textContent();
                  console.log(`🚫 LIMIT MESSAGE DETECTED at transaction ${i}: ${text}`);
                  limitMessage = true;
                  limitHit = true;
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            if (!limitMessage) {
              successfulTransactions++;
              console.log(`✅ Transaction ${i} created successfully`);
            }
            
            // Take screenshot every 5 transactions or if limit hit
            if (i % 5 === 0 || limitHit) {
              await page.screenshot({ 
                path: `tests/screenshots/billing-rapid-${i}.png`, 
                fullPage: true 
              });
            }
          }
        } else {
          console.log(`⚠️ Button not found on attempt ${i}`);
        }
        
      } catch (error) {
        console.log(`❌ Error on attempt ${i}:`, getErrorMessage(error));
      }
      
      // Small delay between attempts
      if (!limitHit) {
        await page.waitForTimeout(500);
      }
    }
    
    console.log(`\n📊 BILLING LIMITS TEST SUMMARY:`);
    console.log(`Successfully created transactions: ${successfulTransactions}`);
    console.log(`Limit hit: ${limitHit ? 'YES' : 'NO'}`);
    console.log(`Expected limit: 10 transactions for free users`);
    
    if (limitHit && successfulTransactions <= 10) {
      console.log('✅ Billing limits working correctly!');
    } else if (successfulTransactions > 10) {
      console.log('⚠️ More than 10 transactions created - limit may not be enforced');
    } else {
      console.log('ℹ️ Test completed without hitting apparent limits');
    }
  });
});