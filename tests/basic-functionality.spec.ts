import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
  
  test('Should load the homepage', async ({ page }) => {
    console.log('🏠 Testing homepage load...');
    
    await page.goto('/', { timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-loaded.png', 
      fullPage: true 
    });
    
    // Check if page has loaded correctly
    await expect(page).toHaveTitle(/financee/i);
    console.log('✅ Homepage loaded successfully');
  });

  test('Should redirect to sign-in when accessing dashboard without auth', async ({ page }) => {
    console.log('🔒 Testing authentication redirect...');
    
    await page.goto('/dashboard');
    
    // Should be redirected to sign-in
    await page.waitForURL('**/sign-in**', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/auth-redirect.png', 
      fullPage: true 
    });
    
    console.log('✅ Correctly redirected to sign-in page');
  });

  test('Should load sign-in page and show login form', async ({ page }) => {
    console.log('📝 Testing sign-in page...');
    
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for any input field to appear
    await page.waitForSelector('input', { timeout: 15000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/signin-page-loaded.png', 
      fullPage: true 
    });
    
    // Check if login form elements are present
    const inputs = await page.locator('input').count();
    expect(inputs).toBeGreaterThan(0);
    
    console.log(`✅ Sign-in page loaded with ${inputs} input fields`);
  });

  test('Should load transactions page (may redirect to auth)', async ({ page }) => {
    console.log('📊 Testing transactions page...');
    
    await page.goto('/transactions');
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot regardless of auth state
    await page.screenshot({ 
      path: 'tests/screenshots/transactions-page.png', 
      fullPage: true 
    });
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('sign-in')) {
      console.log('✅ Correctly redirected to sign-in (not authenticated)');
    } else if (currentUrl.includes('transactions')) {
      console.log('✅ Transactions page loaded (authenticated)');
    } else {
      console.log('⚠️ Unexpected page loaded');
    }
  });

  test('Should identify available buttons and links', async ({ page }) => {
    console.log('🔍 Analyzing page elements...');
    
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Count and log buttons
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log(`Found ${buttons} buttons and ${links} links on homepage`);
    
    // Get button texts (first 10)
    const buttonTexts = await page.locator('button').allTextContents();
    console.log('Button texts:', buttonTexts.slice(0, 10));
    
    // Get link texts (first 10)
    const linkTexts = await page.locator('a').allTextContents();
    console.log('Link texts:', linkTexts.slice(0, 10));
    
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-elements.png', 
      fullPage: true 
    });
    
    console.log('✅ Page elements analyzed');
  });

  test('Should handle basic navigation', async ({ page }) => {
    console.log('🧭 Testing basic navigation...');
    
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Try to find navigation links
    const navSelectors = [
      'nav a',
      '.nav-link',
      '[href="/dashboard"]',
      '[href="/transactions"]',
      '[href="/sign-in"]'
    ];
    
    for (const selector of navSelectors) {
      try {
        const links = await page.locator(selector).count();
        if (links > 0) {
          console.log(`Found ${links} navigation links with selector: ${selector}`);
          
          // Get the href attributes
          const hrefs = await page.locator(selector).evaluateAll(elements => 
            elements.map(el => (el as HTMLAnchorElement).href)
          );
          console.log('Navigation targets:', hrefs);
        }
      } catch (error) {
        // Selector not found, continue
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/navigation-analysis.png', 
      fullPage: true 
    });
    
    console.log('✅ Navigation analysis completed');
  });
});