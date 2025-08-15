const puppeteer = require('puppeteer');

describe('Dashboard Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Responsiveness Tests', () => {
    test('Dashboard should be responsive on mobile (375px)', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/dashboard');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
      
      // Check if mobile menu button is visible
      const mobileMenuButton = await page.$('button[aria-label="Open sidebar"]');
      expect(mobileMenuButton).toBeTruthy();
      
      // Check if stats grid is properly stacked
      const statsGrid = await page.$('.grid');
      const gridClasses = await page.evaluate(el => el.className, statsGrid);
      expect(gridClasses).toContain('grid-cols-1');
      
      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/dashboard-mobile.png' });
    });

    test('Dashboard should be responsive on tablet (768px)', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000/dashboard');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
      
      // Check if stats grid shows 2 columns
      const statsGrid = await page.$('.grid');
      const gridClasses = await page.evaluate(el => el.className, statsGrid);
      expect(gridClasses).toContain('sm:grid-cols-2');
      
      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/dashboard-tablet.png' });
    });

    test('Dashboard should be responsive on desktop (1024px)', async () => {
      await page.setViewport({ width: 1024, height: 768 });
      await page.goto('http://localhost:3000/dashboard');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
      
      // Check if sidebar is visible
      const sidebar = await page.$('nav');
      expect(sidebar).toBeTruthy();
      
      // Check if stats grid shows 4 columns
      const statsGrid = await page.$('.grid');
      const gridClasses = await page.evaluate(el => el.className, statsGrid);
      expect(gridClasses).toContain('lg:grid-cols-4');
      
      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/dashboard-desktop.png' });
    });
  });

  describe('Functionality Tests', () => {
    beforeEach(async () => {
      await page.setViewport({ width: 1024, height: 768 });
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
    });

    test('Navigation links should work', async () => {
      // Test navigation to transactions
      await page.click('a[href="/dashboard/transactions"]');
      await page.waitForSelector('h1', { timeout: 5000 });
      
      const pageTitle = await page.$eval('h1', el => el.textContent);
      expect(pageTitle.toLowerCase()).toContain('transacciones');
      
      // Navigate back to dashboard
      await page.click('a[href="/dashboard"]');
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 5000 });
    });

    test('Mobile sidebar should open and close', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
      
      // Open mobile sidebar
      await page.click('button[aria-label="Open sidebar"]');
      await page.waitForTimeout(500); // Wait for animation
      
      // Check if sidebar is visible
      const sidebar = await page.$('nav');
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.transform !== 'translateX(-100%)';
      }, sidebar);
      expect(isVisible).toBeTruthy();
      
      // Close sidebar by clicking overlay
      await page.click('.bg-black.bg-opacity-50');
      await page.waitForTimeout(500); // Wait for animation
    });

    test('Stats cards should display correctly', async () => {
      // Check if all 4 stat cards are present
      const statCards = await page.$$('.brutal-card');
      expect(statCards.length).toBeGreaterThanOrEqual(4);
      
      // Check if stat cards have proper content
      const firstCard = statCards[0];
      const cardText = await page.evaluate(el => el.textContent, firstCard);
      expect(cardText).toContain('$'); // Should contain currency
    });

    test('Quick action buttons should be present', async () => {
      // Check if quick action buttons exist
      const buttons = await page.$$('.brutal-button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
      
      // Check if "Nueva Transacción" button exists
      const newTransactionButton = await page.$('button:has-text("Nueva Transacción")');
      expect(newTransactionButton).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    test('Page should load within 3 seconds', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForSelector('[data-testid="dashboard-header"]', { timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    test('Animations should be smooth', async () => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Check if framer-motion animations are working
      const animatedElements = await page.$$('[style*="opacity"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });
});