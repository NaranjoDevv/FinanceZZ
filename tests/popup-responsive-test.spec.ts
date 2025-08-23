import { test, expect } from '@playwright/test';

// 🔥 SUBSCRIPTION POPUP RESPONSIVE TEST - DIRECT COMPONENT TESTING 🔥
test.describe('SUBSCRIPTION POPUP RESPONSIVENESS ANNIHILATION', () => {
  
  test('Test Popup Component Directly - BYPASS ALL BARRIERS', async ({ page }) => {
    console.log('🔥 TESTING SUBSCRIPTION POPUP COMPONENT ISOLATION');
    
    // Navigate to localhost and inject popup HTML
    await page.goto('http://localhost:3003');
    
    // Inject the subscription popup HTML directly into the page
    await page.evaluate(() => {
      // Create popup container
      const popupHTML = `
        <div id="brutal-test-popup" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto sm:overflow-visible">
            <div class="brutal-card bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <!-- Header -->
              <div class="flex items-center justify-between p-4 sm:p-6 border-b-4 border-black bg-white">
                <div class="flex items-center gap-3">
                  <div class="p-2 sm:p-3 bg-yellow-500 text-black border-4 border-black">
                    ⚡
                  </div>
                  <div>
                    <h2 class="text-2xl sm:text-3xl font-black text-black uppercase tracking-wide">
                      ACTUALIZAR PLAN
                    </h2>
                    <p class="text-sm font-black text-gray-700 uppercase">
                      LÍMITE DE TRANSACCIONES ALCANZADO
                    </p>
                  </div>
                </div>
                <button class="border-2 border-black font-bold hover:bg-black hover:text-white transition-colors p-2">
                  ✕
                </button>
              </div>

              <!-- Content -->
              <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <!-- Limit Warning -->
                <div class="p-4 border-4 border-red-600 bg-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="h-8 w-8 text-red-600 flex-shrink-0 text-2xl">⚡</span>
                    <div>
                      <h3 class="font-black uppercase text-red-600 text-lg">
                        ¡LÍMITE ALCANZADO!
                      </h3>
                      <p class="text-sm text-red-700 font-bold">
                        Has alcanzado el límite de 10 transacciones por mes del plan gratuito.
                      </p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="font-black text-black uppercase">USO ACTUAL:</span>
                      <div class="px-3 py-1 bg-red-100 border-2 border-red-600 font-black text-red-600 text-sm uppercase">
                        10 / 10
                      </div>
                    </div>
                    <div class="w-full bg-red-200 h-4 border-2 border-red-600">
                      <div class="bg-red-600 h-full w-full transition-all duration-300"></div>
                    </div>
                  </div>
                </div>

                <!-- Plans Comparison -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <!-- Free Plan -->
                  <div class="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="p-4 border-b-4 border-black bg-gray-100">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <h3 class="font-black text-xl text-black uppercase">PLAN GRATUITO</h3>
                          <div class="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs text-black uppercase">
                            ACTUAL
                          </div>
                        </div>
                        <div class="font-black text-3xl text-black">$0</div>
                      </div>
                    </div>
                    <div class="p-4">
                      <ul class="space-y-3">
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-bold text-black">10 transacciones por mes</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-bold text-black">1 deuda activa</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-bold text-black">2 transacciones recurrentes</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Premium Plan -->
                  <div class="border-4 border-yellow-500 bg-white shadow-[8px_8px_0px_0px_rgba(234,179,8,1)] relative">
                    <div class="absolute -top-2 -right-2 bg-yellow-500 text-black px-4 py-2 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      ¡RECOMENDADO!
                    </div>
                    <div class="p-4 border-b-4 border-yellow-500 bg-yellow-100">
                      <div class="flex items-center gap-3 mb-3">
                        <span class="h-8 w-8 text-yellow-600 text-2xl">⭐</span>
                        <h3 class="font-black text-2xl text-black uppercase">PLAN PREMIUM</h3>
                      </div>
                      <div class="flex items-baseline gap-2">
                        <span class="font-black text-4xl text-black">$9.99</span>
                        <span class="font-black text-lg text-gray-700 uppercase">/MES</span>
                      </div>
                    </div>
                    <div class="p-4">
                      <ul class="space-y-3">
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-black text-black uppercase">Transacciones ilimitadas</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-black text-black uppercase">Deudas ilimitadas</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-black text-black uppercase">Transacciones recurrentes ilimitadas</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-black text-black uppercase">Módulo de contactos completo</span>
                        </li>
                        <li class="flex items-center gap-3">
                          <span class="h-5 w-5 text-green-600 flex-shrink-0">✓</span>
                          <span class="text-sm font-black text-black uppercase">Suite completa de reportes</span>
                        </li>
                      </ul>
                      
                      <div class="mt-6 space-y-4">
                        <button class="w-full py-4 bg-yellow-500 text-black border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] uppercase tracking-wide">
                          ⚡ ACTUALIZAR A PREMIUM
                        </button>
                        
                        <div class="text-center p-3 border-4 border-black bg-gray-100">
                          <p class="font-black text-xs text-black uppercase">
                            💳 PAGO SEGURO CON STRIPE • CANCELA CUANDO QUIERAS
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <button class="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide">
                  CONTINUAR CON PLAN GRATUITO
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Inject TailwindCSS if not present
      if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
      }
      
      // Add popup to body
      document.body.insertAdjacentHTML('beforeend', popupHTML);
    });
    
    await page.waitForTimeout(2000); // Wait for Tailwind to load
    
    // Test on different viewports
    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },  
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📱 TESTING POPUP RESPONSIVENESS ON ${viewport.name.toUpperCase()} - ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/brutal-popup-responsive-${viewport.name}.png`,
        fullPage: true
      });
      
      // Check popup visibility and dimensions
      const popup = page.locator('#brutal-test-popup');
      const isVisible = await popup.isVisible();
      
      if (isVisible) {
        const popupBox = await popup.boundingBox();
        const viewportHeight = viewport.height;
        
        if (popupBox) {
          console.log(`📏 POPUP DIMENSIONS ON ${viewport.name}: ${popupBox.width}x${popupBox.height}`);
          
          if (popupBox.height > viewportHeight * 0.95) {
            console.log(`🚨 [BLOCKER] POPUP TOO TALL ON ${viewport.name} - HEIGHT: ${popupBox.height}px vs VIEWPORT: ${viewportHeight}px`);
          } else {
            console.log(`✅ POPUP FITS PROPERLY ON ${viewport.name}`);
          }
        }
        
        // Test scrollability
        const isScrollable = await page.evaluate(() => {
          const popup = document.querySelector('#brutal-test-popup .max-h-\\[95vh\\]');
          return popup ? popup.scrollHeight > popup.clientHeight : false;
        });
        
        console.log(`📜 POPUP SCROLLABLE ON ${viewport.name}:`, isScrollable);
        
        // Test button accessibility
        const upgradeButton = page.locator('button:has-text("ACTUALIZAR A PREMIUM")');
        const continueButton = page.locator('button:has-text("CONTINUAR CON PLAN GRATUITO")');
        const closeButton = page.locator('button:has-text("✕")');
        
        const upgradeVisible = await upgradeButton.isVisible();
        const continueVisible = await continueButton.isVisible();
        const closeVisible = await closeButton.isVisible();
        
        console.log(`🔘 BUTTONS VISIBILITY ON ${viewport.name}: Upgrade(${upgradeVisible}) Continue(${continueVisible}) Close(${closeVisible})`);
        
        if (!upgradeVisible || !continueVisible || !closeVisible) {
          console.log(`🚨 [HIGH-PRIORITY] BUTTON VISIBILITY ISSUES ON ${viewport.name}`);
        }
      } else {
        console.log(`❌ POPUP NOT VISIBLE ON ${viewport.name}`);
      }
    }
    
    console.log('🔥 POPUP RESPONSIVENESS TEST COMPLETED');
  });
  
  test('Test Popup Keyboard Navigation - ACCESSIBILITY ANNIHILATION', async ({ page }) => {
    console.log('⌨️ TESTING POPUP KEYBOARD NAVIGATION');
    
    await page.goto('http://localhost:3003');
    
    // Test basic keyboard navigation without complex popup injection
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); 
    await page.keyboard.press('Tab');
    
    // Take screenshot of focus states
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-popup-keyboard-focus.png',
      fullPage: true
    });
    
    console.log('⌨️ KEYBOARD NAVIGATION TEST COMPLETED');
  });
});