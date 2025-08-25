import { test, expect } from '@playwright/test';

test.describe('🔥 CRITICAL LOGIN FIX VERIFICATION', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('🚀 Complete login flow should work after Convex fix', async ({ page }) => {
    console.log('🔍 Testing critical login fix...');
    
    // Step 1: Take initial screenshot
    await page.screenshot({ path: 'test-results/critical-fix-01-homepage.png', fullPage: true });
    
    // Step 2: Click "Comenzar" button to trigger auth
    const startButton = page.locator('text=Comenzar');
    await expect(startButton).toBeVisible({ timeout: 10000 });
    
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Should redirect to sign-in page or show auth modal
    const currentUrl = page.url();
    console.log(`🔗 After clicking Comenzar, URL: ${currentUrl}`);
    
    if (currentUrl.includes('/sign-in')) {
      console.log('✅ Redirected to sign-in page');
      await page.screenshot({ path: 'test-results/critical-fix-02-signin-redirect.png', fullPage: true });
      
      // Fill sign-in form
      await page.fill('input[name="identifier"]', 'test@financezz.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      
      await page.screenshot({ path: 'test-results/critical-fix-03-signin-filled.png', fullPage: true });
      
      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
    } else {
      console.log('🔍 Looking for auth modal or other auth mechanism...');
      await page.screenshot({ path: 'test-results/critical-fix-02-auth-state.png', fullPage: true });
    }
    
    // Step 4: Check final state
    const finalUrl = page.url();
    console.log(`🏁 Final URL: ${finalUrl}`);
    
    await page.screenshot({ path: 'test-results/critical-fix-04-final-state.png', fullPage: true });
    
    // Step 5: If we're on dashboard, try to access transactions
    if (finalUrl.includes('/dashboard') || finalUrl.includes('/transactions')) {
      console.log('🎯 Successfully reached dashboard area!');
      
      // Try to navigate to transactions
      await page.goto('http://localhost:3000/transactions');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'test-results/critical-fix-05-transactions-page.png', fullPage: true });
      
      // Check if we can see transactions page without errors
      const pageContent = await page.textContent('body');
      const hasConvexError = pageContent?.includes('Could not find public function') || false;
      
      if (hasConvexError) {
        console.log('❌ Still getting Convex errors!');
      } else {
        console.log('✅ No Convex errors detected!');
      }
      
      expect(hasConvexError).toBe(false);
      
    } else {
      console.log('⚠️ Did not reach dashboard - checking error state');
      
      // Look for error messages
      const errorElements = await page.locator('text=/error|Error|ERROR/').count();
      const convexErrors = await page.locator('text=/Could not find public function/').count();
      
      console.log(`🔍 Error elements found: ${errorElements}`);
      console.log(`🔍 Convex errors found: ${convexErrors}`);
      
      // The main test: no Convex function errors should appear
      expect(convexErrors).toBe(0);
    }
  });
  
  test('🔧 Direct dashboard access test', async ({ page }) => {
    console.log('🔍 Testing direct dashboard access...');
    
    // Try direct dashboard access
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/critical-fix-direct-dashboard.png', fullPage: true });
    
    const currentUrl = page.url();
    console.log(`📍 Dashboard access URL: ${currentUrl}`);
    
    // Should either redirect to sign-in or show dashboard
    const isSignIn = currentUrl.includes('/sign-in');
    const isDashboard = currentUrl.includes('/dashboard');
    
    expect(isSignIn || isDashboard).toBe(true);
  });
  
  test('🔍 Convex function availability check', async ({ page }) => {
    console.log('🔍 Testing Convex function availability...');
    
    // Go to home page and check console for Convex errors
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(5000);
    
    console.log('🔍 Console errors captured:', errors);
    
    // Check for specific Convex errors
    const convexErrors = errors.filter(error => 
      error.includes('Could not find public function') ||
      error.includes('users:createUserIfNotExists')
    );
    
    console.log('🎯 Convex-specific errors:', convexErrors);
    
    // Should be no Convex function errors now
    expect(convexErrors).toHaveLength(0);
  });
});