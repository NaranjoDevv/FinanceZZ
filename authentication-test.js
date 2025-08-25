const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AuthenticationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.findings = {
      blockers: [],
      highPriority: [],
      mediumPriority: [],
      nitpicks: []
    };
  }

  async initialize() {
    console.log('🔐 INITIALIZING AUTHENTICATION BRUTALITY TEST 🔐');
    this.browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
    });
    
    this.page.on('pageerror', error => {
      console.error(`PAGE ERROR: ${error.message}`);
      this.findings.blockers.push(`JavaScript Error: ${error.message}`);
    });
    
    await this.page.setViewport({ width: 1440, height: 900 });
  }

  async takeScreenshot(name, description = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auth-test-${name}-${timestamp}.png`;
    const filepath = path.join(__dirname, 'brutal-screenshots', filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    console.log(`📸 AUTH SCREENSHOT: ${filename} - ${description}`);
    return filename;
  }

  async testAuthenticationFlow() {
    try {
      await this.initialize();
      
      console.log('🚀 NAVIGATING TO APPLICATION HOME 🚀');
      await this.page.goto('http://localhost:3001', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await this.takeScreenshot('home-page', 'Home page loaded');
      
      // Click "COMENZAR AHORA" button
      console.log('🔥 CLICKING COMENZAR AHORA BUTTON 🔥');
      const startButton = await this.page.$('text=COMENZAR AHORA');
      if (startButton) {
        await startButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.takeScreenshot('after-start-click', 'After clicking COMENZAR AHORA');
      } else {
        this.findings.highPriority.push('COMENZAR AHORA button not found or not clickable');
      }
      
      // Try to find sign-in form or redirect
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Look for authentication elements
      const authElements = await this.page.evaluate(() => {
        const elements = [];
        
        // Look for sign in buttons
        const signInBtns = document.querySelectorAll('button, a, [role="button"]');
        signInBtns.forEach(btn => {
          const text = btn.textContent.toLowerCase();
          if (text.includes('sign') || text.includes('iniciar') || text.includes('login')) {
            elements.push({
              type: 'signin-button',
              text: btn.textContent,
              visible: btn.offsetParent !== null
            });
          }
        });
        
        // Look for input fields
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
          elements.push({
            type: 'input',
            inputType: input.type,
            placeholder: input.placeholder,
            visible: input.offsetParent !== null
          });
        });
        
        return elements;
      });
      
      console.log('AUTH ELEMENTS FOUND:', authElements);
      
      // Try to navigate to sign-in directly
      console.log('🔐 NAVIGATING TO SIGN-IN PAGE DIRECTLY 🔐');
      await this.page.goto('http://localhost:3001/sign-in', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await this.takeScreenshot('sign-in-page', 'Sign-in page loaded');
      
      // Wait for Clerk to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Look for Clerk sign-in form
      const signInForm = await this.page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        const buttons = document.querySelectorAll('button[type="submit"]');
        
        return {
          formsFound: forms.length,
          emailInputs: inputs.length,
          submitButtons: buttons.length,
          clerkElements: document.querySelectorAll('[data-clerk]').length
        };
      });
      
      console.log('SIGN-IN FORM ANALYSIS:', signInForm);
      
      // Try to fill credentials if form is available
      const emailInput = await this.page.$('input[type="email"]');
      const passwordInput = await this.page.$('input[type="password"]');
      
      if (emailInput && passwordInput) {
        console.log('📝 FILLING AUTHENTICATION CREDENTIALS 📝');
        await emailInput.type('naranjoalejandro96@gmail.com');
        await passwordInput.type('Alejin2092');
        await this.takeScreenshot('credentials-filled', 'Credentials filled in form');
        
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          console.log('🚀 SUBMITTING AUTHENTICATION FORM 🚀');
          await submitButton.click();
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for auth
          await this.takeScreenshot('post-auth-attempt', 'After authentication attempt');
          
          const newUrl = this.page.url();
          console.log(`URL after auth attempt: ${newUrl}`);
          
          if (newUrl.includes('dashboard')) {
            console.log('✅ AUTHENTICATION SUCCESSFUL - DASHBOARD REACHED');
            await this.testDashboardInterface();
          } else {
            this.findings.highPriority.push('Authentication failed or did not redirect to dashboard');
          }
        }
      } else {
        this.findings.highPriority.push('Email or password input fields not found on sign-in page');
      }
      
    } catch (error) {
      console.error('🔥 AUTHENTICATION TEST FAILED:', error);
      this.findings.blockers.push(`Authentication test failed: ${error.message}`);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async testDashboardInterface() {
    console.log('📊 TESTING DASHBOARD INTERFACE BRUTALITY 📊');
    
    await this.takeScreenshot('dashboard-loaded', 'Dashboard interface loaded');
    
    // Test dashboard navigation
    const navElements = await this.page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/"], button');
      return Array.from(links).map(link => ({
        text: link.textContent.trim(),
        href: link.href || 'button',
        visible: link.offsetParent !== null
      })).filter(item => item.text && item.visible);
    });
    
    console.log('DASHBOARD NAVIGATION ELEMENTS:', navElements);
    
    // Test sidebar navigation if present
    const sidebarLinks = navElements.filter(el => 
      el.text.toLowerCase().includes('transaction') ||
      el.text.toLowerCase().includes('budget') ||
      el.text.toLowerCase().includes('report') ||
      el.text.toLowerCase().includes('setting')
    );
    
    if (sidebarLinks.length > 0) {
      console.log('🔗 TESTING NAVIGATION LINKS 🔗');
      for (const link of sidebarLinks.slice(0, 3)) { // Test first 3 links
        try {
          await this.page.click(`a[href="${link.href.replace('http://localhost:3001', '')}"]`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await this.takeScreenshot(`nav-${link.text.toLowerCase().replace(/\s+/g, '-')}`, `Navigation to ${link.text}`);
        } catch (err) {
          console.log(`Failed to navigate to ${link.text}: ${err.message}`);
        }
      }
    }
    
    // Test responsive behavior on dashboard
    await this.page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.takeScreenshot('dashboard-tablet', 'Dashboard tablet view');
    
    await this.page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.takeScreenshot('dashboard-mobile', 'Dashboard mobile view');
  }
}

// Execute the authentication test
(async () => {
  const tester = new AuthenticationTester();
  await tester.testAuthenticationFlow();
  console.log('🏁 AUTHENTICATION TEST COMPLETED 🏁');
})();