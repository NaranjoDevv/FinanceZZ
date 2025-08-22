const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BrutalDesignReviewer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = [];
    this.findings = {
      blockers: [],
      highPriority: [],
      mediumPriority: [],
      nitpicks: []
    };
  }

  async initialize() {
    console.log('🔥 INITIALIZING BRUTAL DESIGN REVIEW ARSENAL 🔥');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Enable console logging to catch errors
    this.page.on('console', msg => {
      console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
    });
    
    this.page.on('pageerror', error => {
      console.error(`PAGE ERROR: ${error.message}`);
      this.findings.blockers.push(`JavaScript Error: ${error.message}`);
    });
  }

  async takeScreenshot(name, description = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `brutal-review-${name}-${timestamp}.png`;
    const filepath = path.join(__dirname, 'brutal-screenshots', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    this.screenshots.push({
      name,
      description,
      filename,
      filepath
    });
    
    console.log(`📸 SCREENSHOT CAPTURED: ${filename} - ${description}`);
    return filename;
  }

  async testViewport(width, height, deviceName) {
    console.log(`📱 TESTING ${deviceName} VIEWPORT: ${width}x${height}`);
    await this.page.setViewport({ width, height });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow layout to settle
    return await this.takeScreenshot(`viewport-${deviceName.toLowerCase()}`, `${deviceName} viewport test`);
  }

  async testResponsiveDesign() {
    console.log('📱 PHASE 2: RESPONSIVE BRUTALITY INITIATED 📱');
    
    // Desktop - 1440px wide
    await this.testViewport(1440, 900, 'Desktop');
    
    // Tablet - 768px wide  
    await this.testViewport(768, 1024, 'Tablet');
    
    // Mobile - 375px wide
    await this.testViewport(375, 667, 'Mobile');
    
    // Check for horizontal scrollbars on mobile
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasHorizontalScroll) {
      this.findings.blockers.push('HORIZONTAL SCROLL DETECTED - Mobile layout FAILS basic responsiveness');
    }
  }

  async testKeyboardNavigation() {
    console.log('⌨️ TESTING KEYBOARD NAVIGATION BRUTALITY ⌨️');
    
    // Reset to desktop viewport for keyboard testing
    await this.page.setViewport({ width: 1440, height: 900 });
    
    // Test Tab navigation
    await this.page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if focus is visible
    const focusVisible = await this.page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return false;
      
      const styles = window.getComputedStyle(focused);
      const hasOutline = styles.outline !== 'none' && styles.outline !== '';
      const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
      const hasBorder = styles.border !== 'none' && styles.border !== '';
      
      return hasOutline || hasBoxShadow || hasBorder;
    });
    
    if (!focusVisible) {
      this.findings.highPriority.push('FOCUS INDICATORS MISSING - Keyboard navigation accessibility VIOLATED');
    }
    
    await this.takeScreenshot('keyboard-focus', 'Keyboard focus state testing');
  }

  async testFormValidation() {
    console.log('📝 TESTING FORM VALIDATION BRUTALITY 📝');
    
    // Look for forms and test them
    const forms = await this.page.$$('form');
    
    for (let i = 0; i < forms.length; i++) {
      console.log(`Testing form ${i + 1}`);
      
      // Try to submit empty form
      const submitButton = await forms[i].$('button[type="submit"], input[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.takeScreenshot(`form-${i + 1}-validation`, `Form ${i + 1} validation testing`);
      }
    }
  }

  async performBrutalReview() {
    try {
      await this.initialize();
      
      console.log('🚀 NAVIGATING TO TARGET APPLICATION 🚀');
      await this.page.goto('http://localhost:3001', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Take initial screenshot
      await this.takeScreenshot('initial-load', 'Initial application load');
      
      // PHASE 1: INTERACTION DOMINATION
      console.log('⚡ PHASE 1: INTERACTION DOMINATION ⚡');
      
      // Test if we need to sign in
      const needsSignIn = await this.page.$('text=Sign in') || await this.page.$('[href*="sign-in"]');
      
      if (needsSignIn) {
        console.log('🔐 AUTHENTICATION REQUIRED - TESTING SIGN-IN FLOW');
        
        // Navigate to sign-in
        const signInButton = await this.page.$('[href*="sign-in"]') || await this.page.$('text=Sign in');
        if (signInButton) {
          await signInButton.click();
          await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
          await this.takeScreenshot('sign-in-page', 'Sign-in page loaded');
          
          // Try to sign in with provided credentials
          const emailInput = await this.page.$('input[type="email"]');
          const passwordInput = await this.page.$('input[type="password"]');
          
          if (emailInput && passwordInput) {
            await emailInput.type('naranjoalejandro96@gmail.com');
            await passwordInput.type('Alejin2092');
            await this.takeScreenshot('sign-in-filled', 'Sign-in form filled');
            
            const submitButton = await this.page.$('button[type="submit"]');
            if (submitButton) {
              await submitButton.click();
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for potential redirect
              await this.takeScreenshot('post-sign-in', 'After sign-in attempt');
            }
          }
        }
      }
      
      // PHASE 2: RESPONSIVE BRUTALITY
      await this.testResponsiveDesign();
      
      // PHASE 3: KEYBOARD NAVIGATION
      await this.testKeyboardNavigation();
      
      // PHASE 4: FORM VALIDATION
      await this.testFormValidation();
      
      // PHASE 5: PERFORMANCE ANALYSIS
      console.log('⚡ PHASE 5: PERFORMANCE ANALYSIS ⚡');
      const performanceMetrics = await this.page.metrics();
      console.log('Performance Metrics:', performanceMetrics);
      
      if (performanceMetrics.JSHeapUsedSize > 50 * 1024 * 1024) { // 50MB
        this.findings.mediumPriority.push('HIGH MEMORY USAGE - JavaScript heap size exceeds 50MB');
      }
      
      console.log('🏁 BRUTAL DESIGN REVIEW COMPLETED 🏁');
      console.log(`📸 Total Screenshots Captured: ${this.screenshots.length}`);
      console.log(`🚨 Blockers Found: ${this.findings.blockers.length}`);
      console.log(`🔥 High Priority Issues: ${this.findings.highPriority.length}`);
      console.log(`⚠️ Medium Priority Issues: ${this.findings.mediumPriority.length}`);
      console.log(`🔍 Nitpicks: ${this.findings.nitpicks.length}`);
      
      return {
        screenshots: this.screenshots,
        findings: this.findings,
        performanceMetrics
      };
      
    } catch (error) {
      console.error('🔥 BRUTAL REVIEW FAILED:', error);
      this.findings.blockers.push(`Review execution failed: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Execute the brutal review
(async () => {
  const reviewer = new BrutalDesignReviewer();
  const results = await reviewer.performBrutalReview();
  
  // Save results to file
  const resultsFile = path.join(__dirname, 'brutal-review-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`📊 Results saved to: ${resultsFile}`);
})();