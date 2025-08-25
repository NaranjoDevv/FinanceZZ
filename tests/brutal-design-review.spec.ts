import { test, expect } from '@playwright/test';

// 🔥 BRUTAL DESIGN REVIEW TEST - NO MERCY FOR WEAK DESIGNS 🔥
test.describe('BRUTAL SUBSCRIPTION POPUP RESPONSIVENESS REVIEW', () => {
  
  test.beforeEach(async ({ page }) => {
    // Update base URL to match actual server port
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
  });

  test('Desktop Full-Height Visibility - DESTROY THE BUG', async ({ page }) => {
    // Set desktop viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-review-desktop-initial.png',
      fullPage: true
    });
    
    console.log('🔥 DESKTOP VIEWPORT SET - HUNTING FOR SUBSCRIPTION POPUP BUGS');
    
    // Try to trigger subscription popup by examining the page state
    const bodyContent = await page.textContent('body');
    console.log('Page content preview:', bodyContent?.substring(0, 200));
  });

  test('Mobile Responsiveness - CRUSH LAYOUT FAILURES', async ({ page }) => {
    // Set mobile viewport (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-review-mobile-initial.png',
      fullPage: true
    });
    
    console.log('📱 MOBILE VIEWPORT SET - SEEKING RESPONSIVE DESTRUCTION');
  });

  test('Tablet Responsiveness - NO MERCY FOR WEAK LAYOUTS', async ({ page }) => {
    // Set tablet viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Take tablet screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-review-tablet-initial.png',
      fullPage: true
    });
    
    console.log('💻 TABLET VIEWPORT SET - LAYOUT MUST ADAPT OR DIE');
  });

  test('Authentication State Analysis - UNDERSTAND THE BEAST', async ({ page }) => {
    // Analyze current authentication state
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-review-auth-analysis.png',
      fullPage: true
    });
    
    // Check for authentication elements
    const authElements = await page.locator('button, a, [role="button"]').all();
    
    for (const element of authElements) {
      const text = await element.textContent();
      if (text?.toLowerCase().includes('sign') || 
          text?.toLowerCase().includes('login') || 
          text?.toLowerCase().includes('auth')) {
        console.log('🔍 FOUND AUTH ELEMENT:', text);
      }
    }
    
    // Look for any modals or popups
    const modals = await page.locator('[role="dialog"], .modal, [data-testid*="modal"]').all();
    console.log('🔥 MODALS FOUND:', modals.length);
  });

  test('Navigation Flow - BRUTAL PATH DISCOVERY', async ({ page }) => {
    // Try to navigate through the app systematically
    
    // Check if we can access dashboard directly
    try {
      await page.goto('http://localhost:3003/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-review-dashboard-attempt.png',
        fullPage: true
      });
      console.log('🎯 DASHBOARD ACCESS ATTEMPT');
    } catch (error) {
      console.log('❌ DASHBOARD ACCESS BLOCKED:', error);
    }
    
    // Check transactions page
    try {
      await page.goto('http://localhost:3003/transactions');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ 
        path: 'tests/screenshots/brutal-review-transactions-attempt.png',
        fullPage: true
      });
      console.log('💳 TRANSACTIONS PAGE ATTEMPT');
    } catch (error) {
      console.log('❌ TRANSACTIONS ACCESS BLOCKED:', error);
    }
  });
});

// 🔥 FREE PLAN LIMITS ENFORCEMENT TEST 🔥
test.describe('FREE PLAN LIMITS BRUTAL ENFORCEMENT', () => {
  
  test('Transaction Limits Stress Test - BREAK THE SYSTEM', async ({ page }) => {
    await page.goto('http://localhost:3003');
    
    // This test will be expanded once we understand the auth flow
    console.log('🚀 PREPARING TO STRESS TEST FREE PLAN LIMITS');
    
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-review-limits-prep.png',
      fullPage: true
    });
  });
});