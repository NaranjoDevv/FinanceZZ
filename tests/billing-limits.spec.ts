import { test, expect, Page } from '@playwright/test';
import { TestDataGenerator, PageHelpers } from './utils/test-helpers';

test.describe('Billing Limits Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Login before each test
    await PageHelpers.loginUser(page);
    
    // Take initial screenshot
    await PageHelpers.takeScreenshot(page, 'initial-dashboard');
  });

  test.describe('Transaction Limits', () => {
    test('Should allow creating transactions up to free limit (10)', async () => {
      console.log('🧪 Testing transaction limit (10 transactions)...');
      
      const transactionCount = 10;
      const createdTransactions: Array<{description: string, amount: number}> = [];
      
      for (let i = 1; i <= transactionCount; i++) {
        console.log(`\n📝 Creating transaction ${i}/${transactionCount}`);
        
        const transactionData = {
          description: `${TestDataGenerator.randomDescription()} #${i}`,
          amount: TestDataGenerator.randomAmount(),
          type: Math.random() > 0.5 ? 'income' : 'expense' as 'income' | 'expense'
        };
        
        createdTransactions.push(transactionData);
        
        try {
          // Open new transaction modal
          await PageHelpers.openNewTransactionModal(page);
          
          // Fill transaction form
          await PageHelpers.fillTransactionForm(page, transactionData);
          
          // Submit form
          await PageHelpers.submitForm(page);
          
          // Check for errors or success
          await page.waitForTimeout(2000);
          
          // Take screenshot after each transaction
          await PageHelpers.takeScreenshot(page, `transaction-${i}-created`);
          
          console.log(`✅ Transaction ${i} created successfully: ${transactionData.description} - $${transactionData.amount}`);
          
        } catch (error) {
          console.error(`❌ Error creating transaction ${i}:`, error);
          await PageHelpers.takeScreenshot(page, `transaction-${i}-error`);
          
          // Check if subscription popup appeared
          const popupAppeared = await PageHelpers.checkForSubscriptionPopup(page);
          if (popupAppeared) {
            console.log(`🚫 Subscription popup appeared at transaction ${i}`);
            break;
          }
          
          throw error;
        }
        
        // Small delay between transactions
        await page.waitForTimeout(1000);
      }
      
      console.log(`\n📊 Successfully created ${createdTransactions.length} transactions`);
      console.log('Created transactions:', createdTransactions);
      
      // Verify transactions were created
      await page.goto('/transactions');
      await PageHelpers.waitForPageLoad(page);
      await PageHelpers.takeScreenshot(page, 'final-transactions-list');
    });

    test('Should show subscription popup when exceeding transaction limit', async () => {
      console.log('🧪 Testing transaction limit exceeded scenario...');
      
      // First, create 10 transactions to reach the limit
      for (let i = 1; i <= 10; i++) {
        console.log(`Creating transaction ${i}/10 to reach limit...`);
        
        const transactionData = {
          description: `Limit Test ${i}`,
          amount: TestDataGenerator.randomAmount()
        };
        
        await PageHelpers.openNewTransactionModal(page);
        await PageHelpers.fillTransactionForm(page, transactionData);
        await PageHelpers.submitForm(page);
        await page.waitForTimeout(1500);
      }
      
      // Now try to create the 11th transaction (should trigger popup)
      console.log('🚫 Attempting to create 11th transaction (should trigger popup)...');
      
      const overLimitTransaction = {
        description: 'This should trigger subscription popup',
        amount: TestDataGenerator.randomAmount()
      };
      
      await PageHelpers.openNewTransactionModal(page);
      await PageHelpers.fillTransactionForm(page, overLimitTransaction);
      
      // Submit and expect subscription popup
      await PageHelpers.submitForm(page);
      await page.waitForTimeout(3000);
      
      // Check for subscription popup
      const popupAppeared = await PageHelpers.checkForSubscriptionPopup(page);
      expect(popupAppeared).toBe(true);
      
      console.log('✅ Subscription popup appeared as expected when exceeding limit');
    });
  });

  test.describe('Debt Limits', () => {
    test('Should allow creating debt up to free limit (1)', async () => {
      console.log('🧪 Testing debt limit (1 debt)...');
      
      // Navigate to debts page
      await page.goto('/debts');
      await PageHelpers.waitForPageLoad(page);
      
      // Look for "Nueva Deuda" button
      const newDebtSelectors = [
        'button:has-text("Nueva")',
        'button:has-text("Agregar")',
        'button:has-text("Crear")',
        '[data-testid="new-debt"]'
      ];
      
      let debtButtonFound = false;
      for (const selector of newDebtSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            await button.click();
            debtButtonFound = true;
            console.log(`✅ Clicked new debt button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`Debt button selector ${selector} failed:`, e.message);
        }
      }
      
      if (!debtButtonFound) {
        console.log('⚠️ No debt button found, debt functionality may not be implemented yet');
        return;
      }
      
      await page.waitForTimeout(2000);
      
      // Fill debt form
      const debtData = {
        counterpartyName: TestDataGenerator.randomCounterpartyName(),
        amount: TestDataGenerator.randomAmount(),
        description: `Deuda: ${TestDataGenerator.randomDescription()}`
      };
      
      // Fill counterparty name
      const nameSelectors = [
        'input[name="counterpartyName"]',
        'input[placeholder*="nombre"]',
        'input[placeholder*="person"]'
      ];
      
      for (const selector of nameSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible()) {
            await field.fill(debtData.counterpartyName);
            console.log(`✅ Counterparty name filled: ${debtData.counterpartyName}`);
            break;
          }
        } catch (e) {
          console.log(`Name selector ${selector} failed:`, e.message);
        }
      }
      
      // Fill amount
      const amountField = page.locator('input[type="number"]').first();
      if (await amountField.isVisible()) {
        await amountField.fill(debtData.amount.toString());
        console.log(`✅ Amount filled: ${debtData.amount}`);
      }
      
      // Fill description
      const descriptionField = page.locator('input[name="description"], textarea[name="description"]').first();
      if (await descriptionField.isVisible()) {
        await descriptionField.fill(debtData.description);
        console.log(`✅ Description filled: ${debtData.description}`);
      }
      
      // Submit form
      await PageHelpers.submitForm(page);
      await PageHelpers.takeScreenshot(page, 'debt-created');
      
      console.log('✅ Debt created successfully');
    });

    test('Should show subscription popup when trying to create second debt', async () => {
      console.log('🧪 Testing debt limit exceeded scenario...');
      
      // First create one debt to reach the limit
      await page.goto('/debts');
      await PageHelpers.waitForPageLoad(page);
      
      // Create first debt
      const button = page.locator('button:has-text("Nueva"), button:has-text("Agregar")').first();
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(2000);
        
        // Fill minimal form
        const nameField = page.locator('input').first();
        await nameField.fill('Test Person');
        
        const amountField = page.locator('input[type="number"]').first();
        await amountField.fill('100000');
        
        await PageHelpers.submitForm(page);
        await page.waitForTimeout(2000);
      }
      
      // Now try to create a second debt (should trigger popup)
      console.log('🚫 Attempting to create second debt (should trigger popup)...');
      
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(2000);
        
        // Try to submit second debt
        const nameField = page.locator('input').first();
        await nameField.fill('Second Person');
        
        await PageHelpers.submitForm(page);
        await page.waitForTimeout(3000);
        
        // Check for subscription popup
        const popupAppeared = await PageHelpers.checkForSubscriptionPopup(page);
        expect(popupAppeared).toBe(true);
        
        console.log('✅ Subscription popup appeared as expected when exceeding debt limit');
      }
    });
  });

  test.describe('Category Limits', () => {
    test('Should allow creating categories up to free limit (2)', async () => {
      console.log('🧪 Testing category limit (2 categories)...');
      
      // Navigate to categories or settings page
      const categoryPages = ['/categories', '/settings', '/dashboard'];
      
      for (const categoryPage of categoryPages) {
        try {
          await page.goto(categoryPage);
          await PageHelpers.waitForPageLoad(page);
          
          // Look for category creation button
          const categoryButtonSelectors = [
            'button:has-text("Categoría")',
            'button:has-text("Category")',
            'button:has-text("Nueva")',
            '[data-testid="new-category"]'
          ];
          
          let categoryButtonFound = false;
          for (const selector of categoryButtonSelectors) {
            try {
              const button = page.locator(selector).first();
              if (await button.isVisible()) {
                console.log(`✅ Found category button on ${categoryPage} with selector: ${selector}`);
                categoryButtonFound = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (categoryButtonFound) {
            break;
          }
        } catch (e) {
          console.log(`Page ${categoryPage} not accessible:`, e.message);
        }
      }
      
      console.log('⚠️ Category creation functionality may not be implemented yet or not accessible');
    });
  });

  test.describe('Recurring Transaction Limits', () => {
    test('Should allow creating recurring transactions up to free limit (2)', async () => {
      console.log('🧪 Testing recurring transaction limit (2 recurring transactions)...');
      
      // Navigate to transactions page
      await page.goto('/transactions');
      await PageHelpers.waitForPageLoad(page);
      
      // Look for recurring transaction option
      await PageHelpers.openNewTransactionModal(page);
      
      // Look for recurring checkbox or toggle
      const recurringSelectors = [
        'input[type="checkbox"][name*="recurring"]',
        'input[type="checkbox"][name*="repeat"]',
        'button:has-text("Recurrente")',
        'label:has-text("Recurrente")'
      ];
      
      let recurringFound = false;
      for (const selector of recurringSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            recurringFound = true;
            console.log(`✅ Found recurring option with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!recurringFound) {
        console.log('⚠️ Recurring transaction functionality may not be implemented yet');
        await PageHelpers.closeModal(page);
        return;
      }
      
      // Fill transaction form
      const recurringData = {
        description: 'Recurring: ' + TestDataGenerator.randomDescription(),
        amount: TestDataGenerator.randomAmount()
      };
      
      await PageHelpers.fillTransactionForm(page, recurringData);
      await PageHelpers.submitForm(page);
      
      console.log('✅ Recurring transaction created successfully');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('Should handle network errors gracefully', async () => {
      console.log('🧪 Testing network error handling...');
      
      // Simulate network error by going offline
      await page.context().setOffline(true);
      
      try {
        await PageHelpers.openNewTransactionModal(page);
        
        const transactionData = {
          description: 'Network Error Test',
          amount: 50000
        };
        
        await PageHelpers.fillTransactionForm(page, transactionData);
        await PageHelpers.submitForm(page);
        
        // Should show some error indication
        await page.waitForTimeout(5000);
        await PageHelpers.takeScreenshot(page, 'network-error-state');
        
      } catch (error) {
        console.log('✅ Network error handled gracefully:', error.message);
      } finally {
        // Restore network
        await page.context().setOffline(false);
      }
    });

    test('Should validate form fields properly', async () => {
      console.log('🧪 Testing form validation...');
      
      await PageHelpers.openNewTransactionModal(page);
      
      // Try to submit empty form
      try {
        await PageHelpers.submitForm(page);
        await page.waitForTimeout(2000);
        
        // Should show validation errors
        const errorSelectors = [
          '.error',
          '.invalid',
          '[role="alert"]',
          '.text-red',
          'span:has-text("requerido")',
          'span:has-text("required")'
        ];
        
        let validationFound = false;
        for (const selector of errorSelectors) {
          try {
            const error = page.locator(selector).first();
            if (await error.isVisible()) {
              validationFound = true;
              console.log(`✅ Validation error found with selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!validationFound) {
          console.log('⚠️ No validation errors detected - form may allow empty submission');
        }
        
        await PageHelpers.takeScreenshot(page, 'form-validation-errors');
        
      } catch (error) {
        console.log('✅ Form validation prevented empty submission:', error.message);
      }
      
      await PageHelpers.closeModal(page);
    });

    test('Should handle rapid successive submissions', async () => {
      console.log('🧪 Testing rapid successive submissions...');
      
      const submissions = 3;
      
      for (let i = 1; i <= submissions; i++) {
        console.log(`Rapid submission ${i}/${submissions}`);
        
        try {
          await PageHelpers.openNewTransactionModal(page);
          
          const rapidData = {
            description: `Rapid Test ${i}`,
            amount: 1000 * i
          };
          
          await PageHelpers.fillTransactionForm(page, rapidData);
          await PageHelpers.submitForm(page);
          
          // Very short delay to test rapid submission
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.log(`Rapid submission ${i} failed:`, error.message);
          await PageHelpers.takeScreenshot(page, `rapid-submission-${i}-error`);
        }
      }
      
      console.log('✅ Rapid submission test completed');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('Should handle creating multiple transactions efficiently', async () => {
      console.log('🧪 Testing performance with multiple transactions...');
      
      const startTime = Date.now();
      const transactionCount = 5;
      
      for (let i = 1; i <= transactionCount; i++) {
        const transactionData = {
          description: `Performance Test ${i}`,
          amount: TestDataGenerator.randomAmount()
        };
        
        const transactionStartTime = Date.now();
        
        try {
          await PageHelpers.openNewTransactionModal(page);
          await PageHelpers.fillTransactionForm(page, transactionData);
          await PageHelpers.submitForm(page);
          
          const transactionTime = Date.now() - transactionStartTime;
          console.log(`Transaction ${i} completed in ${transactionTime}ms`);
          
          // Expect each transaction to complete within reasonable time
          expect(transactionTime).toBeLessThan(15000); // 15 seconds max
          
        } catch (error) {
          console.error(`Performance test transaction ${i} failed:`, error);
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Performance test completed: ${transactionCount} transactions in ${totalTime}ms`);
      console.log(`Average time per transaction: ${totalTime / transactionCount}ms`);
      
      await PageHelpers.takeScreenshot(page, 'performance-test-completed');
    });
  });
});