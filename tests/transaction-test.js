const { chromium } = require('playwright');

async function testTransactions() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando prueba de transacciones...');
    
    // Navegar a la página de sign-in
    console.log('Navegando a la página de sign-in...');
    await page.goto('http://localhost:3000/sign-in');
    await page.waitForTimeout(3000);
    
    // Tomar captura de pantalla para ver la página
    await page.screenshot({ path: 'tests/screenshots/sign-in-page.png', fullPage: true });
    console.log('Captura de pantalla guardada: sign-in-page.png');
    
    // Buscar y llenar el formulario de email/password
    console.log('Buscando formulario de login...');
    
    // Esperar a que aparezcan los campos de entrada
    await page.waitForSelector('input', { timeout: 10000 });
    
    // Intentar encontrar campos de email y password
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    console.log('Verificando visibilidad de campos...');
    const emailVisible = await emailInput.isVisible();
    const passwordVisible = await passwordInput.isVisible();
    console.log('Email visible:', emailVisible, 'Password visible:', passwordVisible);
    
    if (emailVisible && passwordVisible) {
      console.log('Llenando credenciales...');
      await emailInput.fill('naranjoalejandro96@gmail.com');
      await passwordInput.fill('Alejin2092');
      
      // Tomar captura después de llenar campos
      await page.screenshot({ path: 'tests/screenshots/form-filled.png', fullPage: true });
      
      // Buscar botones de submit más específicamente
      console.log('Buscando botón de submit...');
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Continue")',
        'input[type="submit"]',
        '[role="button"]:has-text("Sign")',
        'form button'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          submitButton = button;
          console.log('Botón encontrado con selector:', selector);
          break;
        }
      }
      
      if (submitButton) {
        await submitButton.click();
        console.log('Botón de submit clickeado');
        
        // Esperar a que la autenticación se complete
        await page.waitForTimeout(5000);
        console.log('Autenticación completada, navegando a transacciones...');
      } else {
        console.log('No se encontró botón de submit visible');
        // Intentar presionar Enter en el campo de password
        await passwordInput.press('Enter');
        await page.waitForTimeout(5000);
      }
    } else {
      console.log('Campos de login no encontrados o no visibles');
    }
    
    // Navegar a la página de transacciones
    console.log('Navegando a la página de transacciones...');
    await page.goto('http://localhost:3000/transactions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Página de transacciones cargada');

    // Tomar captura de pantalla inicial
    await page.screenshot({ path: 'tests/screenshots/transactions-initial.png', fullPage: true });
    console.log('Captura de pantalla guardada: transactions-initial.png');

    // 1. CREAR NUEVA TRANSACCIÓN
    console.log('📝 Creando nueva transacción...');
    
    // Buscar y hacer clic en el botón "Nueva Transacción" o similar
    const newTransactionSelectors = [
      'button:has-text("Nueva")',
      'button:has-text("Agregar")', 
      'button:has-text("Crear")',
      'button:has-text("New")',
      '[data-testid="new-transaction"]',
      'button[aria-label*="nueva"]',
      'button[aria-label*="new"]'
    ];
    
    let newTransactionButton = null;
    for (const selector of newTransactionSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        newTransactionButton = button;
        console.log('Botón nueva transacción encontrado con selector:', selector);
        break;
      }
    }
    
    if (newTransactionButton) {
      await newTransactionButton.click();
      await page.waitForTimeout(2000);
      
      // Tomar captura del modal/formulario
      await page.screenshot({ path: 'tests/screenshots/new-transaction-modal.png', fullPage: true });
      console.log('Captura de pantalla guardada: new-transaction-modal.png');
      
      // Buscar campos del formulario con múltiples selectores
      console.log('Buscando campos del formulario...');
      
      // Wait for modal to be fully loaded
      await page.waitForTimeout(3000);
      
      // Debug: List all input fields in the modal
      const allInputs = await page.locator('input').all();
      console.log(`Total inputs found: ${allInputs.length}`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');
        const isVisible = await input.isVisible();
        console.log(`Input ${i}: type=${type}, placeholder="${placeholder}", visible=${isVisible}`);
      }
      
      const descriptionSelectors = [
        'input[placeholder="¿En qué gastaste o ganaste?"]',
        'input[placeholder*="gastaste"]',
        'input[name="description"]',
        'input[id*="description"]',
        'input[type="text"]:not([type="number"])'
      ];
      
      const amountSelectors = [
        'input[placeholder="5000"]',
        'input[type="number"]',
        'input[step="1000"]',
        'input[min="0"]'
      ];
      
      // Buscar campo de descripción
      let descriptionField = null;
      for (const selector of descriptionSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible()) {
            descriptionField = field;
            console.log('Campo descripción encontrado con selector:', selector);
            break;
          }
        } catch (e) {
          console.log(`Error con selector ${selector}:`, e.message);
        }
      }
      
      // Buscar campo de monto
      let amountField = null;
      for (const selector of amountSelectors) {
        try {
          const field = page.locator(selector).first();
          if (await field.isVisible()) {
            amountField = field;
            console.log('Campo monto encontrado con selector:', selector);
            break;
          }
        } catch (e) {
          console.log(`Error con selector ${selector}:`, e.message);
        }
      }
      
      if (descriptionField && amountField) {
        // Fill transaction form
        console.log('Filling transaction form...');
        
        // Wait for form to be fully loaded
        await page.waitForTimeout(2000);
        
        // Fill description field - using the exact placeholder from the component
        console.log('Looking for description field...');
        await descriptionField.fill('Test Transaction Description');
        console.log('Description filled');
        
        // Fill amount field - using the exact placeholder and type from the component
        console.log('Looking for amount field...');
        await amountField.fill('50000');
        console.log('Amount filled');
        
        // Seleccionar tipo de transacción (gasto)
        const typeSelect = page.locator('select[name="type"], [data-testid="transaction-type"]').first();
        if (await typeSelect.isVisible()) {
          await typeSelect.selectOption('expense');
        }
        
        // Seleccionar categoría
        const categorySelect = page.locator('select[name="category"], select[name="categoryId"], [data-testid="category-select"]').first();
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption({ index: 1 }); // Seleccionar la primera categoría disponible
        }

        // Guardar la transacción
        const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Save"), button[type="submit"]').first();
        await saveButton.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ No se encontraron los campos del formulario');
        throw new Error('Campos del formulario no encontrados');
      }
    } else {
      console.log('❌ No se encontró el botón de nueva transacción');
      throw new Error('Botón de nueva transacción no encontrado');
    }
    
    console.log('✅ Transacción creada exitosamente');
    await page.screenshot({ path: 'tests/screenshots/transaction-created.png' });
    
    // Wait for the transaction to appear in the list
    await page.waitForTimeout(3000);
    
    // Take screenshot of transactions list with new transaction
    await page.screenshot({ path: 'tests/screenshots/transactions-with-new.png' });
    console.log('Captura de pantalla guardada: transactions-with-new.png');

    // 2. EDITAR TRANSACCIÓN
    console.log('✏️ Editando transacción...');
    
    // Look for edit buttons in the transaction list
    const editSelectors = [
      'button:has-text("Editar")',
      'button[aria-label*="edit"]',
      'button[title*="edit"]',
      'button[title*="Editar"]',
      '[data-testid="edit-button"]',
      'svg[data-testid="edit-icon"]',
      '.edit-button',
      'button:has(svg)',  // Look for buttons with SVG icons
      'tr:first-child button', // First row edit button
      'tbody tr:first-child button' // First transaction row button
    ];
    
    let editButton = null;
    for (const selector of editSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        for (const button of buttons) {
          if (await button.isVisible()) {
            editButton = button;
            console.log(`Botón de editar encontrado con selector: ${selector}`);
            break;
          }
        }
        if (editButton) break;
      } catch (e) {
        console.log(`Error con selector de editar ${selector}:`, e.message);
      }
    }
    
    if (editButton) {
        // Try different click methods to handle intercepted clicks
        try {
          await editButton.click({ force: true });
        } catch (e) {
          console.log('Force click failed, trying JavaScript click...');
          await editButton.evaluate(button => button.click());
        }
        await page.waitForTimeout(3000);
      
      // Take screenshot of edit modal
      await page.screenshot({ path: 'tests/screenshots/edit-transaction-modal.png' });
      console.log('Captura de pantalla guardada: edit-transaction-modal.png');
      
      // Modify the description in edit modal
      const editDescriptionField = page.locator('input[placeholder="¿En qué gastaste o ganaste?"]').first();
      if (await editDescriptionField.isVisible()) {
        await editDescriptionField.clear();
        await editDescriptionField.fill('Test Transaction Description - EDITED');
        
        // Save changes
        const saveSelectors = [
          'button:has-text("Guardar")',
          'button:has-text("Actualizar")',
          'button:has-text("ACTUALIZAR")',
          'button:has-text("GUARDAR")',
          'button[type="submit"]'
        ];
        
        let saveButton = null;
        for (const selector of saveSelectors) {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            saveButton = button;
            console.log(`Botón guardar encontrado: ${selector}`);
            break;
          }
        }
        
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          console.log('✅ Transacción editada exitosamente');
          await page.screenshot({ path: 'tests/screenshots/transaction-edited.png' });
        } else {
          console.log('⚠️ No se encontró botón de guardar');
        }
      } else {
        console.log('⚠️ No se encontró campo de descripción en modal de edición');
      }
    } else {
      console.log('⚠️ No se encontró botón de editar, continuando...');
    }

    // 3. ELIMINAR TRANSACCIÓN
    console.log('🗑️ Eliminando transacción...');
    
    // Look for delete buttons
    const deleteSelectors = [
      'button:has-text("Eliminar")',
      'button:has-text("Delete")',
      'button:has-text("ELIMINAR")',
      'button[aria-label*="delete"]',
      'button[title*="delete"]',
      'button[title*="Eliminar"]',
      '[data-testid="delete-button"]',
      'svg[data-testid="delete-icon"]',
      '.delete-button',
      'tr:first-child button:last-child', // Last button in first row (usually delete)
      'tbody tr:first-child button:last-child'
    ];
    
    let deleteButton = null;
    for (const selector of deleteSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        for (const button of buttons) {
          if (await button.isVisible()) {
            deleteButton = button;
            console.log(`Botón de eliminar encontrado con selector: ${selector}`);
            break;
          }
        }
        if (deleteButton) break;
      } catch (e) {
        console.log(`Error con selector de eliminar ${selector}:`, e.message);
      }
    }
    
    if (deleteButton) {
      await deleteButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of delete confirmation
      await page.screenshot({ path: 'tests/screenshots/delete-confirmation.png' });
      console.log('Captura de pantalla guardada: delete-confirmation.png');
      
      // Confirm deletion
      const confirmSelectors = [
        'button:has-text("Confirmar")',
        'button:has-text("Eliminar")',
        'button:has-text("ELIMINAR")',
        'button:has-text("CONFIRMAR")',
        'button:has-text("Sí")',
        'button:has-text("Yes")',
        'button[type="submit"]'
      ];
      
      let confirmButton = null;
      for (const selector of confirmSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          confirmButton = button;
          console.log(`Botón confirmar encontrado: ${selector}`);
          break;
        }
      }
      
      if (confirmButton) {
        await confirmButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Transacción eliminada exitosamente');
        await page.screenshot({ path: 'tests/screenshots/transaction-deleted.png' });
      } else {
        console.log('⚠️ No se encontró botón de confirmación');
      }
    } else {
      console.log('⚠️ No se encontró botón de eliminar');
    }

    console.log('🎉 Prueba de transacciones completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// Ejecutar la prueba
testTransactions().catch(console.error);