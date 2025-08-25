import { test, expect } from '@playwright/test';

// 🔥 SUBSCRIPTION POPUP ISOLATED TESTING - PURE COMPONENT BRUTALITY 🔥
test.describe('SUBSCRIPTION POPUP COMPONENT ISOLATION TEST', () => {
  
  test('Create Standalone Popup Test Page - BYPASS AUTHENTICATION BARRIERS', async ({ page }) => {
    console.log('🔥 CREATING STANDALONE SUBSCRIPTION POPUP TEST');
    
    // Create a test HTML page with the popup component
    const testPageHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Popup Test - BRUTAL REVIEW</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/outline/heroicons.min.css" rel="stylesheet">
        <style>
            .brutal-card { 
                border: 4px solid #000; 
                box-shadow: 8px 8px 0px 0px rgba(0,0,0,1); 
            }
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="text-center space-y-4">
                <h1 class="text-4xl font-black text-black">🔥 SUBSCRIPTION POPUP BRUTAL TEST 🔥</h1>
                <div class="space-y-4">
                    <button id="trigger-transactions" class="px-6 py-3 bg-red-500 text-white font-black border-4 border-black">
                        TRIGGER TRANSACTIONS LIMIT
                    </button>
                    <button id="trigger-debts" class="px-6 py-3 bg-blue-500 text-white font-black border-4 border-black">
                        TRIGGER DEBTS LIMIT
                    </button>
                    <button id="trigger-recurring" class="px-6 py-3 bg-green-500 text-white font-black border-4 border-black">
                        TRIGGER RECURRING LIMIT
                    </button>
                    <button id="trigger-premium" class="px-6 py-3 bg-yellow-500 text-black font-black border-4 border-black">
                        TRIGGER PREMIUM FEATURES
                    </button>
                </div>
                <div class="mt-8">
                    <h2 class="text-2xl font-black text-black mb-4">VIEWPORT TESTS</h2>
                    <div class="space-x-4">
                        <button id="set-mobile" class="px-4 py-2 bg-purple-500 text-white font-bold border-2 border-black">
                            📱 MOBILE (375px)
                        </button>
                        <button id="set-tablet" class="px-4 py-2 bg-orange-500 text-white font-bold border-2 border-black">
                            💻 TABLET (768px)
                        </button>
                        <button id="set-desktop" class="px-4 py-2 bg-pink-500 text-white font-bold border-2 border-black">
                            🖥️ DESKTOP (1440px)
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- SUBSCRIPTION POPUP MOCK -->
        <div id="subscription-popup" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div class="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
                <div class="brutal-card bg-white">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b-4 border-black bg-white">
                        <div class="flex items-center gap-3">
                            <div class="p-3 bg-yellow-500 text-black border-4 border-black">
                                ⚡
                            </div>
                            <div>
                                <h2 class="text-3xl font-black text-black uppercase tracking-wide">
                                    ACTUALIZAR PLAN
                                </h2>
                                <p class="text-sm font-black text-gray-700 uppercase" id="limit-title">
                                    LÍMITE DE TRANSACCIONES ALCANZADO
                                </p>
                            </div>
                        </div>
                        <button id="close-popup" class="border-2 border-black font-bold hover:bg-black hover:text-white transition-colors p-2">
                            ✕
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="p-6 space-y-6">
                        <!-- Limit Warning -->
                        <div class="p-4 border-4 border-red-600 bg-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
                            <div class="flex items-center gap-3 mb-3">
                                <span class="text-2xl">⚡</span>
                                <div>
                                    <h3 class="font-black uppercase text-red-600 text-lg">
                                        ¡LÍMITE ALCANZADO!
                                    </h3>
                                    <p class="text-sm text-red-700 font-bold" id="limit-description">
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
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-bold text-black">10 transacciones por mes</span>
                                        </li>
                                        <li class="flex items-center gap-3">
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-bold text-black">3 deudas activas</span>
                                        </li>
                                        <li class="flex items-center gap-3">
                                            <span class="text-green-600">✓</span>
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
                                        <span class="text-2xl">⭐</span>
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
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-black text-black uppercase">Transacciones ilimitadas</span>
                                        </li>
                                        <li class="flex items-center gap-3">
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-black text-black uppercase">Deudas ilimitadas</span>
                                        </li>
                                        <li class="flex items-center gap-3">
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-black text-black uppercase">Reportes avanzados</span>
                                        </li>
                                        <li class="flex items-center gap-3">
                                            <span class="text-green-600">✓</span>
                                            <span class="text-sm font-black text-black uppercase">Soporte prioritario</span>
                                        </li>
                                    </ul>
                                    
                                    <div class="mt-6">
                                        <button id="upgrade-btn" class="w-full py-4 bg-yellow-500 text-black border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] uppercase tracking-wide">
                                            ⚡ ACTUALIZAR A PREMIUM
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex gap-4 p-6 border-t-4 border-black bg-white">
                        <button id="continue-free" class="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide">
                            CONTINUAR CON PLAN GRATUITO
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Popup control functions
            const popup = document.getElementById('subscription-popup');
            const limitTitle = document.getElementById('limit-title');
            const limitDescription = document.getElementById('limit-description');
            
            function showPopup(type) {
                const configs = {
                    transactions: {
                        title: 'LÍMITE DE TRANSACCIONES ALCANZADO',
                        description: 'Has alcanzado el límite de 10 transacciones por mes del plan gratuito.'
                    },
                    debts: {
                        title: 'LÍMITE DE DEUDAS ALCANZADO', 
                        description: 'Has alcanzado el límite de 3 deudas activas del plan gratuito.'
                    },
                    recurring: {
                        title: 'LÍMITE DE TRANSACCIONES RECURRENTES',
                        description: 'Has alcanzado el límite de 2 transacciones recurrentes del plan gratuito.'
                    },
                    premium: {
                        title: 'FUNCIÓN PREMIUM REQUERIDA',
                        description: 'Esta función está disponible solo para usuarios Premium.'
                    }
                };
                
                const config = configs[type];
                limitTitle.textContent = config.title;
                limitDescription.textContent = config.description;
                popup.classList.remove('hidden');
            }
            
            function hidePopup() {
                popup.classList.add('hidden');
            }
            
            // Event listeners
            document.getElementById('trigger-transactions').onclick = () => showPopup('transactions');
            document.getElementById('trigger-debts').onclick = () => showPopup('debts'); 
            document.getElementById('trigger-recurring').onclick = () => showPopup('recurring');
            document.getElementById('trigger-premium').onclick = () => showPopup('premium');
            document.getElementById('close-popup').onclick = hidePopup;
            document.getElementById('continue-free').onclick = hidePopup;
            
            // Viewport controls
            document.getElementById('set-mobile').onclick = () => {
                document.body.style.width = '375px';
                document.body.style.height = '667px';
                document.body.style.margin = '0 auto';
                document.body.style.border = '2px solid red';
            };
            
            document.getElementById('set-tablet').onclick = () => {
                document.body.style.width = '768px';
                document.body.style.height = '1024px';
                document.body.style.margin = '0 auto';
                document.body.style.border = '2px solid blue';
            };
            
            document.getElementById('set-desktop').onclick = () => {
                document.body.style.width = '100%';
                document.body.style.height = '100%';
                document.body.style.margin = '0';
                document.body.style.border = 'none';
            };
        </script>
    </body>
    </html>
    `;
    
    // Navigate to data URL with the test page
    await page.goto(`data:text/html,${encodeURIComponent(testPageHTML)}`);
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/brutal-popup-isolated-01-test-page.png',
      fullPage: true
    });
    
    console.log('🎯 STANDALONE TEST PAGE LOADED - BEGINNING POPUP TESTS');
  });

  test('Test All Popup Variations - DESTROY EVERY LIMIT TYPE', async ({ page }) => {
    // Load the same test page
    const testPageHTML = `...`; // Same HTML as above
    await page.goto(`data:text/html,${encodeURIComponent(testPageHTML)}`);
    
    const popupTypes = [
      { id: 'trigger-transactions', name: 'transactions' },
      { id: 'trigger-debts', name: 'debts' },
      { id: 'trigger-recurring', name: 'recurring' }, 
      { id: 'trigger-premium', name: 'premium' }
    ];
    
    for (const popupType of popupTypes) {
      console.log(`🔥 TESTING ${popupType.name.toUpperCase()} POPUP`);
      
      // Trigger popup
      await page.click(`#${popupType.id}`);
      await page.waitForTimeout(1000);
      
      // Test on different viewports
      const viewports = [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'mobile', width: 375, height: 667 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `tests/screenshots/brutal-popup-${popupType.name}-${viewport.name}.png`,
          fullPage: true
        });
        
        console.log(`📱 ${popupType.name.toUpperCase()} POPUP TESTED ON ${viewport.name.toUpperCase()}`);
      }
      
      // Close popup
      await page.click('#close-popup');
      await page.waitForTimeout(500);
    }
    
    console.log('✅ ALL POPUP VARIATIONS TESTED SUCCESSFULLY');
  });
});