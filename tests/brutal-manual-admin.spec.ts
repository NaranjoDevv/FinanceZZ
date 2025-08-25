import { test, expect } from '@playwright/test';

test.describe('🔥 MANUAL BRUTAL ADMIN TEST 🔥', () => {

  test('🎯 MANUAL LOGIN Y EXPLORACIÓN COMPLETA', async ({ page }) => {
    console.log('🔥 INICIANDO MISIÓN MANUAL BRUTAL...');
    
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // 1. Ir directamente a sign-in
    await page.goto('http://localhost:3004/sign-in');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Screenshot del login
    await page.screenshot({ 
      path: 'test-results/manual-01-signin-page.png', 
      fullPage: true 
    });
    
    // 2. Completar login con credenciales reales
    console.log('🔥 COMPLETANDO LOGIN...');
    
    // Llenar email
    await page.fill('input[type="email"]', 'xopef49932@iotrama.com');
    await page.fill('input[type="password"]', 'Alejin2092');
    
    // Screenshot con credenciales
    await page.screenshot({ 
      path: 'test-results/manual-02-credentials-filled.png', 
      fullPage: true 
    });
    
    // Forzar click en el botón Continue
    await page.locator('button:has-text("Continue")').click({ force: true });
    
    // Esperar redirección
    await page.waitForTimeout(5000);
    
    // Screenshot después del login
    await page.screenshot({ 
      path: 'test-results/manual-03-after-login.png', 
      fullPage: true 
    });
    
    console.log('✅ LOGIN COMPLETADO');
    
    // 3. Intentar ir al panel admin
    console.log('🔥 NAVEGANDO A /admin...');
    
    await page.goto('http://localhost:3004/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/manual-04-admin-panel.png', 
      fullPage: true 
    });
    
    // 4. Probar /admin/users
    console.log('🔥 NAVEGANDO A /admin/users...');
    
    await page.goto('http://localhost:3004/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/manual-05-admin-users.png', 
      fullPage: true 
    });
    
    // 5. Probar /admin/plans
    console.log('🔥 NAVEGANDO A /admin/plans...');
    
    await page.goto('http://localhost:3004/admin/plans');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/manual-06-admin-plans.png', 
      fullPage: true 
    });
    
    // 6. Obtener información de la página de planes
    const pageTitle = await page.title();
    const url = page.url();
    
    console.log(`📊 PÁGINA: ${pageTitle}`);
    console.log(`🔗 URL: ${url}`);
    
    // 7. Verificar si hay contenido específico de admin
    const adminContent = await page.locator('h1, h2, [data-testid*="admin"]').allTextContents();
    console.log(`🔍 CONTENIDO ADMIN ENCONTRADO: ${adminContent.join(', ')}`);
    
    console.log('✅ EXPLORACIÓN MANUAL COMPLETADA');
  });
});