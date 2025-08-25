import { test, expect, Page } from '@playwright/test';

test.describe('🔥 BRUTAL ADMIN LOGIN & PANEL TEST 🔥', () => {
  let page: Page;
  
  const SUPERADMIN_CREDENTIALS = {
    email: 'xopef49932@iotrama.com',
    password: 'Alejin2092'
  };

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('🎯 FASE 1: NAVEGACIÓN INICIAL Y LANDING PAGE', async () => {
    console.log('🔥 ATACANDO LA LANDING PAGE...');
    
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
    
    // Screenshot de la landing page
    await page.screenshot({ 
      path: 'test-results/brutal-01-landing-page.png', 
      fullPage: true 
    });
    
    console.log('✅ LANDING PAGE CAPTURADA');
  });

  test('⚔️ FASE 2: PROCESO DE LOGIN SUPERADMIN', async () => {
    console.log('🔥 INICIANDO ASALTO DE LOGIN...');
    
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
    
    // Buscar y hacer clic en "COMENZAR AHORA"
    const startButton = page.locator('text=COMENZAR AHORA').or(
      page.locator('text=Comenzar ahora')
    ).or(
      page.locator('[href*="/sign-in"]')
    ).or(
      page.locator('button:has-text("COMENZAR")')
    );
    
    if (await startButton.count() > 0) {
      await startButton.first().click();
      console.log('✅ BOTÓN COMENZAR AHORA CLICKEADO');
    } else {
      // Si no encuentra el botón, ir directamente a sign-in
      await page.goto('http://localhost:3004/sign-in');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot del formulario de login
    await page.screenshot({ 
      path: 'test-results/brutal-02-login-form.png', 
      fullPage: true 
    });
    
    // Completar formulario de login
    console.log('🔥 COMPLETANDO CREDENCIALES SUPERADMIN...');
    
    const emailInput = page.locator('input[type="email"]').or(
      page.locator('input[name="email"]')
    ).or(
      page.locator('input[placeholder*="email" i]')
    );
    
    const passwordInput = page.locator('input[type="password"]').or(
      page.locator('input[name="password"]')
    );
    
    await emailInput.fill(SUPERADMIN_CREDENTIALS.email);
    await passwordInput.fill(SUPERADMIN_CREDENTIALS.password);
    
    // Screenshot con credenciales completadas
    await page.screenshot({ 
      path: 'test-results/brutal-03-login-filled.png', 
      fullPage: true 
    });
    
    // Submit del formulario
    const submitButton = page.locator('button[type="submit"]').or(
      page.locator('button:has-text("Sign in")')
    ).or(
      page.locator('button:has-text("Iniciar")')
    );
    
    await submitButton.click();
    
    // Esperar redirección
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Screenshot del dashboard después del login
    await page.screenshot({ 
      path: 'test-results/brutal-04-dashboard-after-login.png', 
      fullPage: true 
    });
    
    console.log('✅ LOGIN COMPLETADO - DASHBOARD CAPTURADO');
  });

  test('🏴‍☠️ FASE 3: ACCESO AL PANEL ADMIN', async () => {
    console.log('🔥 PREPARANDO ASALTO AL PANEL ADMIN...');
    
    // Login primero
    await page.goto('http://localhost:3004/sign-in');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').or(
      page.locator('input[name="email"]')
    );
    const passwordInput = page.locator('input[type="password"]').or(
      page.locator('input[name="password"]')
    );
    
    await emailInput.fill(SUPERADMIN_CREDENTIALS.email);
    await passwordInput.fill(SUPERADMIN_CREDENTIALS.password);
    
    const submitButton = page.locator('button[type="submit"]').or(
      page.locator('button:has-text("Sign in")')
    );
    await submitButton.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navegar directamente al panel admin
    console.log('🔥 ATACANDO /admin...');
    await page.goto('http://localhost:3004/admin');
    await page.waitForLoadState('networkidle');
    
    // Screenshot del panel admin principal
    await page.screenshot({ 
      path: 'test-results/brutal-05-admin-panel.png', 
      fullPage: true 
    });
    
    console.log('✅ PANEL ADMIN PRINCIPAL CAPTURADO');
  });

  test('💀 FASE 4: EXPLORACIÓN DE OPCIONES ADMIN', async () => {
    console.log('🔥 INICIANDO EXPLORACIÓN SISTEMÁTICA...');
    
    // Login setup
    await page.goto('http://localhost:3004/sign-in');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.fill(SUPERADMIN_CREDENTIALS.email);
    await passwordInput.fill(SUPERADMIN_CREDENTIALS.password);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Explorar /admin/users
    console.log('🔥 ATACANDO /admin/users...');
    await page.goto('http://localhost:3004/admin/users');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/brutal-06-admin-users.png', 
      fullPage: true 
    });
    
    // Explorar /admin/plans
    console.log('🔥 ATACANDO /admin/plans...');
    await page.goto('http://localhost:3004/admin/plans');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/brutal-07-admin-plans.png', 
      fullPage: true 
    });
    
    console.log('✅ EXPLORACIÓN ADMIN COMPLETADA');
  });

  test('🔍 FASE 5: ANÁLISIS DETALLADO DE PLANES', async () => {
    console.log('🔥 ANALIZANDO ESTRUCTURA DE PLANES...');
    
    // Login setup
    await page.goto('http://localhost:3004/sign-in');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await emailInput.fill(SUPERADMIN_CREDENTIALS.email);
    await passwordInput.fill(SUPERADMIN_CREDENTIALS.password);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Ir a planes y analizar contenido
    await page.goto('http://localhost:3004/admin/plans');
    await page.waitForLoadState('networkidle');
    
    // Capturar elementos específicos
    const planElements = await page.locator('[data-testid*="plan"], .plan-card, [class*="plan"]').all();
    
    console.log(`🔥 ENCONTRADOS ${planElements.length} ELEMENTOS DE PLAN`);
    
    // Screenshot detallado de la página de planes
    await page.screenshot({ 
      path: 'test-results/brutal-08-plans-detailed.png', 
      fullPage: true 
    });
    
    // Intentar obtener información del DOM
    const pageContent = await page.content();
    console.log('✅ ANÁLISIS DE PLANES COMPLETADO');
  });
});