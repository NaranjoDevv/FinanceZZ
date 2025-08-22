import { Page } from '@playwright/test';

// Random data generators
export class TestDataGenerator {
  private static descriptions = [
    'Compra de supermercado', 'Pago de servicios', 'Salario mensual', 'Freelance work',
    'Cena en restaurante', 'Gasolina', 'Medicamentos', 'Ropa nueva',
    'Suscripción Netflix', 'Uber', 'Amazon compra', 'Ingreso extra',
    'Factura electricidad', 'Internet', 'Teléfono móvil', 'Seguro auto',
    'Inversión', 'Dividendos', 'Venta online', 'Consulta médica',
    'Gimnasio', 'Café', 'Libros', 'Curso online'
  ];

  private static categories = [
    'Alimentación', 'Transporte', 'Salud', 'Entretenimiento',
    'Servicios', 'Ropa', 'Educación', 'Inversiones',
    'Trabajo', 'Hogar', 'Tecnología', 'Viajes'
  ];

  private static counterpartyNames = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Luis Rodríguez', 'Sofia Hernández', 'Miguel Torres', 'Laura Sánchez',
    'Pedro Ramírez', 'Carmen Flores', 'Jorge Díaz', 'Isabel Ruiz'
  ];

  static randomDescription(): string {
    return this.descriptions[Math.floor(Math.random() * this.descriptions.length)];
  }

  static randomAmount(): number {
    // Generate amounts between 1000 and 1000000 (1K to 1M COP)
    return Math.floor(Math.random() * 999000) + 1000;
  }

  static randomCategory(): string {
    return this.categories[Math.floor(Math.random() * this.categories.length)];
  }

  static randomCounterpartyName(): string {
    return this.counterpartyNames[Math.floor(Math.random() * this.counterpartyNames.length)];
  }

  static randomDate(): Date {
    const start = new Date();
    start.setMonth(start.getMonth() - 1); // Last month
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static randomEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const names = ['juan', 'maria', 'carlos', 'ana', 'luis', 'sofia'];
    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${name}${number}@${domain}`;
  }

  static randomPhone(): string {
    return `+57 3${Math.floor(Math.random() * 900000000) + 100000000}`;
  }
}

// Page helper functions for common actions
export class PageHelpers {
  static async waitForPageLoad(page: Page): Promise<void> {
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Warning: Page load timeout, continuing anyway...');
      await page.waitForTimeout(3000);
    }
  }

  static async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ 
      path: `tests/screenshots/billing-limits-${name}.png`, 
      fullPage: true 
    });
  }

  static async loginUser(page: Page, email: string = 'naranjoalejandro96@gmail.com', password: string = 'Alejin2092'): Promise<void> {
    console.log('🔐 Logging in user...');
    
    try {
      await page.goto('/sign-in', { timeout: 15000 });
      await this.waitForPageLoad(page);
      
      // Wait for login form with increased timeout
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 });
      
      // Fill credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await emailInput.fill(email);
      await passwordInput.fill(password);
      
      // Submit form
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000); // Wait for authentication
      
      // Wait for redirect to dashboard or success indicator
      try {
        await page.waitForURL('**/dashboard**', { timeout: 10000 });
      } catch (urlError) {
        // If not redirected to dashboard, check if we're still on sign-in with errors
        const currentUrl = page.url();
        if (currentUrl.includes('sign-in')) {
          throw new Error('Login failed - still on sign-in page');
        }
        console.log('Login completed, current URL:', currentUrl);
      }
      
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('Login error:', error.message);
      await this.takeScreenshot(page, 'login-failed');
      throw error;
    }
  }

  static async openNewTransactionModal(page: Page): Promise<void> {
    console.log('📝 Opening new transaction modal...');
    
    // Navigate to transactions page
    await page.goto('/transactions');
    await this.waitForPageLoad(page);
    
    // Look for "Nueva Transacción" button
    const buttonSelectors = [
      'button:has-text("Nueva")',
      'button:has-text("Agregar")',
      'button:has-text("Crear")',
      '[data-testid="new-transaction"]',
      'button[aria-label*="nueva"]'
    ];
    
    let buttonFound = false;
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          buttonFound = true;
          console.log(`✅ Clicked new transaction button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} not found:`, e.message);
      }
    }
    
    if (!buttonFound) {
      throw new Error('No se encontró el botón para crear nueva transacción');
    }
    
    await page.waitForTimeout(2000);
  }

  static async fillTransactionForm(page: Page, data: {
    description: string;
    amount: number;
    type?: 'income' | 'expense';
  }): Promise<void> {
    console.log('📋 Filling transaction form...', data);
    
    // Wait for modal to load
    await page.waitForTimeout(3000);
    
    // Fill description
    const descriptionSelectors = [
      'input[placeholder*="gastaste"]',
      'input[name="description"]',
      'input[placeholder*="descripción"]',
      'textarea[name="description"]'
    ];
    
    let descriptionFilled = false;
    for (const selector of descriptionSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible()) {
          await field.fill(data.description);
          descriptionFilled = true;
          console.log(`✅ Description filled with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Description selector ${selector} failed:`, e.message);
      }
    }
    
    if (!descriptionFilled) {
      throw new Error('No se pudo llenar el campo de descripción');
    }
    
    // Fill amount
    const amountSelectors = [
      'input[type="number"]',
      'input[placeholder="5000"]',
      'input[step="1000"]',
      'input[name="amount"]'
    ];
    
    let amountFilled = false;
    for (const selector of amountSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible()) {
          await field.fill(data.amount.toString());
          amountFilled = true;
          console.log(`✅ Amount filled with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Amount selector ${selector} failed:`, e.message);
      }
    }
    
    if (!amountFilled) {
      throw new Error('No se pudo llenar el campo de monto');
    }
    
    // Select transaction type if needed
    if (data.type) {
      const typeSelectors = [
        `button:has-text("${data.type === 'income' ? 'Ingreso' : 'Gasto'}")`,
        `[value="${data.type}"]`,
        `input[value="${data.type}"]`
      ];
      
      for (const selector of typeSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            console.log(`✅ Transaction type selected: ${data.type}`);
            break;
          }
        } catch (e) {
          console.log(`Type selector ${selector} failed:`, e.message);
        }
      }
    }
    
    await page.waitForTimeout(1000);
  }

  static async submitForm(page: Page): Promise<boolean> {
    console.log('💾 Submitting form...');
    
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Crear")',
      'button:has-text("Guardar")',
      'button:has-text("Save")',
      'button:has-text("Submit")'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          console.log(`✅ Form submitted with selector: ${selector}`);
          await page.waitForTimeout(3000);
          return true;
        }
      } catch (e) {
        console.log(`Submit selector ${selector} failed:`, e.message);
      }
    }
    
    throw new Error('No se pudo enviar el formulario');
  }

  static async checkForSubscriptionPopup(page: Page): Promise<boolean> {
    console.log('🔍 Checking for subscription popup...');
    
    const popupSelectors = [
      '[data-testid="subscription-popup"]',
      'div:has-text("límite")',
      'div:has-text("suscripción")',
      'div:has-text("premium")',
      'button:has-text("Actualizar")',
      '.brutal-modal:has-text("límite")'
    ];
    
    for (const selector of popupSelectors) {
      try {
        const popup = page.locator(selector).first();
        if (await popup.isVisible()) {
          console.log(`✅ Subscription popup found with selector: ${selector}`);
          await this.takeScreenshot(page, 'subscription-popup-triggered');
          return true;
        }
      } catch (e) {
        // Selector not found, continue
      }
    }
    
    console.log('ℹ️ No subscription popup detected');
    return false;
  }

  static async closeModal(page: Page): Promise<void> {
    const closeSelectors = [
      'button:has-text("Cancelar")',
      'button:has-text("Cerrar")',
      'button[aria-label="Close"]',
      '[data-testid="close-modal"]',
      '.brutal-modal button:first-child'
    ];
    
    for (const selector of closeSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(1000);
          return;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // Try pressing Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }
}