import { test, expect } from '@playwright/test';

// 🔥 BRUTAL SUBSCRIPTION POPUP COMPREHENSIVE TEST 🔥
test.describe('SUBSCRIPTION POPUP RESPONSIVENESS ANNIHILATION', () => {
  
  test('Authentication Flow and Dashboard Access - PENETRATE THE SYSTEM', async ({ page }) => {
    console.log('🔥 BEGINNING BRUTAL AUTHENTICATION PENETRATION');
    
    // Start from landing page
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    // Look for and click "COMENZAR AHORA" button
    const startButton = page.locator('text=COMENZAR AHORA');
    if (await startButton.isVisible()) {
      console.log('🎯 FOUND START BUTTON - CLICKING TO PENETRATE');
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // Take screenshot after clicking start
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-popup-auth-flow-01.png',
        fullPage: true
      });
    }
    
    // Try to access dashboard directly with auth
    try {
      await page.goto('http://localhost:3003/dashboard');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-popup-dashboard-access.png',
        fullPage: true
      });
      
      console.log('🚀 DASHBOARD ACCESS SUCCESSFUL');
    } catch (error) {
      console.log('❌ DASHBOARD BLOCKED - ANALYZING AUTH REQUIREMENTS');
    }
    
    // Look for authentication modals or redirects
    const authElements = await page.locator('[data-testid*="auth"], [data-testid*="sign"], .auth-modal, [role="dialog"]').all();
    console.log('🔍 AUTH ELEMENTS FOUND:', authElements.length);
  });

  test('Transaction Page Access and Limit Testing - BREAK THE LIMITS', async ({ page }) => {
    console.log('💳 BEGINNING TRANSACTION LIMITS DESTRUCTION');
    
    // Try direct access to transactions
    await page.goto('http://localhost:3003/transactions');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-popup-transactions-direct.png',
      fullPage: true
    });
    
    // Look for transaction creation buttons
    const createButtons = await page.locator('text=Nueva transacción, text=Crear transacción, text=Añadir, button[data-testid*="create"], button[data-testid*="new"]').all();
    
    if (createButtons.length > 0) {
      console.log('🎯 TRANSACTION CREATION BUTTONS FOUND:', createButtons.length);
      
      // Try to click first create button
      const firstButton = createButtons[0];
      if (firstButton) {
        await firstButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/brutal-popup-transaction-creation-attempt.png',
          fullPage: true
        });
        
        // Look for subscription popup
        const subscriptionPopup = await page.locator('[data-testid*="subscription"], [data-testid*="popup"], [data-testid*="upgrade"], text=PREMIUM, text=ACTUALIZAR PLAN').first();
        
        if (await subscriptionPopup.isVisible()) {
          console.log('🔥 SUBSCRIPTION POPUP DETECTED - BEGINNING RESPONSIVE ANNIHILATION');
          
          // Test popup on multiple viewports
          await testPopupResponsiveness(page);
        } else {
          console.log('⚠️ NO SUBSCRIPTION POPUP FOUND - INVESTIGATING LIMIT ENFORCEMENT');
        }
      }
    }
  });

  test('Recurring Transactions Limit Test - DESTROY RECURRING LIMITS', async ({ page }) => {
    await page.goto('http://localhost:3003/recurring-transactions');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-popup-recurring-access.png',
      fullPage: true
    });
    
    console.log('🔄 ACCESSING RECURRING TRANSACTIONS PAGE');
  });

  test('Debts Page Limit Test - DEMOLISH DEBT LIMITS', async ({ page }) => {
    await page.goto('http://localhost:3003/debts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-popup-debts-access.png',
      fullPage: true
    });
    
    console.log('💸 ACCESSING DEBTS PAGE');
  });

  // Helper function to test popup responsiveness
  async function testPopupResponsiveness(page: any) {
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
        path: `tests/screenshots/brutal-popup-${viewport.name}-responsive.png`,
        fullPage: true
      });
      
      // Test popup visibility and scrollability
      const popup = page.locator('[data-testid*="subscription"], [role="dialog"]').first();
      
      if (await popup.isVisible()) {
        const popupBox = await popup.boundingBox();
        const viewportHeight = viewport.height;
        
        if (popupBox && popupBox.height > viewportHeight * 0.95) {
          console.log(`🚨 [BLOCKER] POPUP TOO TALL ON ${viewport.name} - HEIGHT: ${popupBox.height}px vs VIEWPORT: ${viewportHeight}px`);
        }
        
        // Test scrollability
        const isScrollable = await page.evaluate(() => {
          const popup = document.querySelector('[data-testid*="subscription"], [role="dialog"]');
          return popup ? popup.scrollHeight > popup.clientHeight : false;
        });
        
        console.log(`📏 POPUP SCROLLABLE ON ${viewport.name}:`, isScrollable);
      }
    }
  }
});