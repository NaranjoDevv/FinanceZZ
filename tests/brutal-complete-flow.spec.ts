import { test, expect } from '@playwright/test';

// 🔥 BRUTAL COMPLETE APPLICATION FLOW TEST 🔥
test.describe('COMPLETE SUBSCRIPTION POPUP FLOW - RUTHLESS TESTING', () => {
  
  test('Full Authentication and Limit Testing Flow - DESTROY ALL BARRIERS', async ({ page }) => {
    console.log('🔥 BEGINNING COMPLETE BRUTAL FLOW TEST');
    
    // Navigate to homepage
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-flow-01-homepage.png',
      fullPage: true
    });
    
    // Look for authentication elements on homepage
    const comenzarButton = page.locator('text=COMENZAR AHORA');
    if (await comenzarButton.isVisible()) {
      console.log('🎯 CLICKING COMENZAR AHORA BUTTON');
      await comenzarButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-flow-02-after-comenzar.png',
        fullPage: true
      });
    }
    
    // Check if we're on sign-in page or redirected
    const pageTitle = await page.title();
    const pageContent = await page.textContent('body');
    
    console.log('📝 Current Page Title:', pageTitle);
    console.log('🔍 Page Content Preview:', pageContent?.substring(0, 300));
    
    // Look for sign-in elements
    const signInText = page.locator('text=INICIAR SESIÓN');
    if (await signInText.isVisible()) {
      console.log('🚀 SIGN-IN PAGE DETECTED - AUTHENTICATION REQUIRED');
      
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-flow-03-signin-page.png',
        fullPage: true
      });
      
      // Look for authentication input fields
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="correo"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"], input[placeholder*="contraseña"]');
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log('📧 AUTHENTICATION FORM FOUND - ATTEMPTING LOGIN');
        
        // Try demo credentials (common test credentials)
        const testCredentials = [
          { email: 'test@test.com', password: 'password' },
          { email: 'demo@demo.com', password: 'demo123' },
          { email: 'user@example.com', password: 'test123' }
        ];
        
        for (const creds of testCredentials) {
          console.log(`🔑 TRYING CREDENTIALS: ${creds.email}`);
          
          await emailInput.fill(creds.email);
          await passwordInput.fill(creds.password);
          
          // Look for login button
          const loginButton = page.locator('button:has-text("Iniciar"), button:has-text("Login"), button[type="submit"]');
          if (await loginButton.isVisible()) {
            await loginButton.click();
            await page.waitForTimeout(5000);
            
            // Check if login succeeded
            const isAuthenticated = await this.checkAuthenticationState(page);
            if (isAuthenticated) {
              console.log('✅ AUTHENTICATION SUCCESSFUL!');
              break;
            }
          }
        }
      }
    }
    
    // Check final authentication state
    const finalAuthState = await this.checkAuthenticationState(page);
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-flow-04-final-state.png',
      fullPage: true
    });
    
    if (finalAuthState) {
      console.log('🚀 PROCEEDING TO SUBSCRIPTION POPUP TESTING');
      await this.testSubscriptionPopupFlow(page);
    } else {
      console.log('❌ AUTHENTICATION FAILED - UNABLE TO TEST SUBSCRIPTION POPUP');
    }
  });
  
  // Helper function to check authentication state
  async function checkAuthenticationState(page: any): Promise<boolean> {
    // Look for authenticated app indicators
    const authIndicators = [
      'text=DASHBOARD',
      'text=TRANSACCIONES',
      'text=NUEVA TRANSACCIÓN',
      '[data-testid*="dashboard"]',
      '.sidebar',
      'text=MI CUENTA'
    ];
    
    for (const indicator of authIndicators) {
      if (await page.locator(indicator).isVisible()) {
        console.log('✅ AUTHENTICATED STATE DETECTED:', indicator);
        return true;
      }
    }
    
    return false;
  }
  
  // Helper function to test subscription popup
  async function testSubscriptionPopupFlow(page: any) {
    console.log('💳 BEGINNING SUBSCRIPTION POPUP LIMIT TESTING');
    
    // Navigate to transactions page
    const transactionsLink = page.locator('text=TRANSACCIONES, a[href*="transactions"]');
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click();
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-flow-05-transactions-page.png',
      fullPage: true
    });
    
    // Look for "New Transaction" button
    const newTransactionBtn = page.locator('text=NUEVA TRANSACCIÓN, text=Nueva transacción, button:has-text("Nueva"), [data-testid*="new-transaction"]');
    
    let popupTriggered = false;
    
    // Try to create multiple transactions to trigger limit
    for (let i = 1; i <= 15; i++) {
      console.log(`💥 ATTEMPTING TO CREATE TRANSACTION ${i} - TESTING LIMITS`);
      
      if (await newTransactionBtn.isVisible()) {
        await newTransactionBtn.click();
        await page.waitForTimeout(2000);
        
        // Check if subscription popup appeared
        const subscriptionPopup = await page.locator('[data-testid*="subscription"], text=PREMIUM, text=ACTUALIZAR PLAN, text=LÍMITE ALCANZADO').first();
        
        if (await subscriptionPopup.isVisible()) {
          console.log(`🚨 SUBSCRIPTION POPUP TRIGGERED AFTER ${i} ATTEMPTS!`);
          popupTriggered = true;
          
          await page.screenshot({ 
            path: `tests/screenshots/brutal-flow-06-popup-triggered-${i}.png`,
            fullPage: true
          });
          
          // Test popup responsiveness
          await this.testPopupResponsiveness(page, i);
          break;
        }
        
        // Fill transaction form if modal appeared
        const transactionModal = page.locator('[role="dialog"], .modal');
        if (await transactionModal.isVisible()) {
          // Fill in transaction details quickly
          await this.fillTransactionForm(page, i);
        }
        
        await page.waitForTimeout(1000);
      }
    }
    
    if (!popupTriggered) {
      console.log('⚠️ SUBSCRIPTION POPUP NOT TRIGGERED - INVESTIGATING LIMIT IMPLEMENTATION');
    }
  }
  
  // Helper function to fill transaction form
  async function fillTransactionForm(page: any, index: number) {
    console.log(`📝 FILLING TRANSACTION FORM ${index}`);
    
    // Select expense type
    const gastoBtn = page.locator('text=GASTO, text=Gasto');
    if (await gastoBtn.isVisible()) {
      await gastoBtn.click();
    }
    
    // Fill amount
    const amountInput = page.locator('input[name*="amount"], input[placeholder*="monto"], input[type="number"]').first();
    if (await amountInput.isVisible()) {
      await amountInput.fill(`${(index * 100).toString()}`);
    }
    
    // Fill description
    const descriptionInput = page.locator('input[name*="description"], textarea, input[placeholder*="descripción"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(`Test Transaction ${index}`);
    }
    
    // Submit the form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Crear"), button:has-text("Guardar")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
  }
  
  // Helper function to test popup responsiveness
  async function testPopupResponsiveness(page: any, attemptNumber: number) {
    console.log('📱 TESTING SUBSCRIPTION POPUP RESPONSIVENESS');
    
    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      console.log(`📱 TESTING POPUP ON ${viewport.name.toUpperCase()} - ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/brutal-popup-${viewport.name}-${attemptNumber}.png`,
        fullPage: true
      });
      
      // Test popup scrollability and visibility
      const popup = page.locator('[role="dialog"], [data-testid*="subscription"]').first();
      
      if (await popup.isVisible()) {
        const popupBox = await popup.boundingBox();
        const viewportHeight = viewport.height;
        
        if (popupBox && popupBox.height > viewportHeight * 0.95) {
          console.log(`🚨 [BLOCKER] POPUP TOO TALL ON ${viewport.name} - HEIGHT: ${popupBox.height}px vs VIEWPORT: ${viewportHeight}px`);
        }
        
        // Test if popup is scrollable
        const isScrollable = await page.evaluate(() => {
          const popup = document.querySelector('[role="dialog"], [data-testid*="subscription"]');
          return popup ? popup.scrollHeight > popup.clientHeight : false;
        });
        
        console.log(`📏 POPUP SCROLLABLE ON ${viewport.name}:`, isScrollable);
        
        // Test close functionality
        const closeBtn = popup.locator('button:has-text("×"), button:has-text("Cerrar"), [aria-label*="close"]');
        if (await closeBtn.isVisible()) {
          console.log(`✅ CLOSE BUTTON FOUND ON ${viewport.name}`);
        } else {
          console.log(`🚨 [HIGH-PRIORITY] NO CLOSE BUTTON ON ${viewport.name}`);
        }
      }
    }
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1440, height: 900 });
  }
});