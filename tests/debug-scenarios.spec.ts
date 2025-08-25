import { test, expect, Page } from '@playwright/test';
import { TestDataGenerator, PageHelpers, getErrorMessage } from './utils/test-helpers';

// Helper function for debugging form fields
async function debugFormFields(page: Page) {
  console.log('🔍 Debugging form fields in modal...');
  
  // Wait for form to load
  await page.waitForTimeout(2000);
  
  // Log all form elements
  const formInputs = await page.locator('input, textarea, select').all();
  console.log(`Found ${formInputs.length} form fields:`);
  
  for (let i = 0; i < formInputs.length; i++) {
    const field = formInputs[i];
    if (!field) continue;
    
    const tagName = await field.evaluate(el => el.tagName);
    const type = await field.getAttribute('type');
    const placeholder = await field.getAttribute('placeholder');
    const name = await field.getAttribute('name');
    const id = await field.getAttribute('id');
    const isVisible = await field.isVisible();
    const isDisabled = await field.isDisabled();
    
    console.log(`Field ${i}: ${tagName} type="${type}" name="${name}" id="${id}" placeholder="${placeholder}" visible=${isVisible} disabled=${isDisabled}`);
  }
  
  // Test filling fields with random data
  console.log('🧪 Testing form field filling...');
  
  try {
    const testData = {
      description: TestDataGenerator.randomDescription(),
      amount: TestDataGenerator.randomAmount()
    };
    
    await PageHelpers.fillTransactionForm(page, testData);
    console.log('✅ Form fields filled successfully');
    await PageHelpers.takeScreenshot(page, 'debug-form-filled');
    
  } catch (error) {
    console.error('❌ Error filling form fields:', getErrorMessage(error));
    await PageHelpers.takeScreenshot(page, 'debug-form-fill-error');
  }
}

test.describe('Debug and Error Scenarios', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test.describe('Authentication Debugging', () => {
    test('Should debug login process step by step', async () => {
      console.log('🔍 Debugging login process...');
      
      await page.goto('/sign-in');
      await PageHelpers.waitForPageLoad(page);
      await PageHelpers.takeScreenshot(page, 'debug-login-01-initial');
      
      // Check if Clerk iframe is present
      const clerkFrames = page.frames().filter(frame => 
        frame.url().includes('clerk') || frame.url().includes('accounts')
      );
      console.log(`Found ${clerkFrames.length} Clerk frames`);
      
      // Log all visible input fields
      const inputs = await page.locator('input').all();
      console.log(`Found ${inputs.length} input fields:`);
      
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!input) continue;
        
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        const isVisible = await input.isVisible();
        
        console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}", visible=${isVisible}`);
      }
      
      // Check for buttons
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons:`);
      
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const button = buttons[i];
        if (!button) continue;
        
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        
        console.log(`Button ${i}: text="${text}", visible=${isVisible}`);
      }
      
      await PageHelpers.takeScreenshot(page, 'debug-login-02-analysis');
      
      // Try to login if fields are found
      try {
        await PageHelpers.loginUser(page);
        await PageHelpers.takeScreenshot(page, 'debug-login-03-success');
        console.log('✅ Login successful');
      } catch (error) {
        console.error('❌ Login failed:', getErrorMessage(error));
        await PageHelpers.takeScreenshot(page, 'debug-login-03-failed');
      }
    });

    test('Should handle missing environment variables', async () => {
      console.log('🔍 Debugging environment configuration...');
      
      // Navigate to a page that requires auth
      await page.goto('/dashboard');
      await page.waitForTimeout(5000);
      
      // Check if redirected to sign-in
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('sign-in')) {
        console.log('✅ Properly redirected to sign-in page');
      } else if (currentUrl.includes('dashboard')) {
        console.log('⚠️ Already authenticated or auth bypass');
      } else {
        console.log('❌ Unexpected redirect or error page');
      }
      
      await PageHelpers.takeScreenshot(page, 'debug-env-check');
    });
  });

  test.describe('Modal and Form Debugging', () => {
    test('Should debug transaction modal loading issues', async () => {
      console.log('🔍 Debugging transaction modal...');
      
      // Login first
      try {
        await PageHelpers.loginUser(page);
      } catch (error) {
        console.log('⚠️ Login failed, continuing with modal debug...');
      }
      
      await page.goto('/transactions');
      await PageHelpers.waitForPageLoad(page);
      await PageHelpers.takeScreenshot(page, 'debug-modal-01-transactions-page');
      
      // Log all buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons on transactions page:`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        if (!button) continue;
        
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        const className = await button.getAttribute('class');
        
        console.log(`Button ${i}: "${text}" (visible: ${isVisible}) class="${className}"`);
      }
      
      // Try to find and click new transaction button
      const newTransactionSelectors = [
        'button:has-text("Nueva")',
        'button:has-text("Agregar")',
        'button:has-text("Crear")',
        'button:has-text("+")',
        '[data-testid*="new"]',
        '[aria-label*="nueva"]',
        '.brutal-button'
      ];
      
      let buttonClicked = false;
      for (const selector of newTransactionSelectors) {
        try {
          const button = page.locator(selector).first();
          const isVisible = await button.isVisible();
          console.log(`Checking selector "${selector}": visible=${isVisible}`);
          
          if (isVisible) {
            await button.click();
            buttonClicked = true;
            console.log(`✅ Successfully clicked button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Selector "${selector}" failed: ${getErrorMessage(error)}`);
        }
      }
      
      if (!buttonClicked) {
        console.log('❌ No new transaction button found or clickable');
        await PageHelpers.takeScreenshot(page, 'debug-modal-02-no-button');
        return;
      }
      
      await page.waitForTimeout(3000);
      await PageHelpers.takeScreenshot(page, 'debug-modal-03-after-click');
      
      // Check if modal opened
      const modalSelectors = [
        '.modal',
        '.brutal-modal',
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.overlay'
      ];
      
      let modalFound = false;
      for (const selector of modalSelectors) {
        try {
          const modal = page.locator(selector).first();
          if (await modal.isVisible()) {
            modalFound = true;
            console.log(`✅ Modal found with selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.log(`Modal selector "${selector}" failed: ${getErrorMessage(error)}`);
        }
      }
      
      if (!modalFound) {
        console.log('❌ No modal found after button click');
        await PageHelpers.takeScreenshot(page, 'debug-modal-04-no-modal');
      } else {
        console.log('✅ Modal opened successfully');
        await PageHelpers.takeScreenshot(page, 'debug-modal-04-modal-open');
        
        // Debug form fields in modal
        await debugFormFields(page);
      }
    });
  });

  test.describe('Performance Debugging', () => {
    test('Should debug page load performance', async () => {
      console.log('🔍 Debugging page load performance...');
      
      const pages = ['/sign-in', '/dashboard', '/transactions', '/debts'];
      const performanceData: Array<{page: string, loadTime: number, success: boolean}> = [];
      
      for (const pagePath of pages) {
        console.log(`Testing page: ${pagePath}`);
        
        const startTime = Date.now();
        let success = false;
        
        try {
          await page.goto(pagePath);
          await PageHelpers.waitForPageLoad(page);
          success = true;
        } catch (error) {
          console.error(`Error loading ${pagePath}:`, getErrorMessage(error));
        }
        
        const loadTime = Date.now() - startTime;
        performanceData.push({ page: pagePath, loadTime, success });
        
        console.log(`${pagePath}: ${loadTime}ms (${success ? 'success' : 'failed'})`);
        
        await PageHelpers.takeScreenshot(page, `debug-performance-${pagePath.replace('/', '')}`);
        
        // Small delay between page loads
        await page.waitForTimeout(1000);
      }
      
      // Summary
      console.log('\n📊 Performance Summary:');
      performanceData.forEach(data => {
        console.log(`${data.page}: ${data.loadTime}ms (${data.success ? '✅' : '❌'})`);
      });
      
      const averageLoadTime = performanceData
        .filter(d => d.success)
        .reduce((sum, d) => sum + d.loadTime, 0) / performanceData.filter(d => d.success).length;
      
      console.log(`Average load time: ${averageLoadTime.toFixed(2)}ms`);
    });
  });
});