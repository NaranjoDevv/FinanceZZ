// Script para probar los límites de usuarios gratuitos
// Este script se puede ejecutar en la consola del navegador

console.log('=== TESTING USER LIMITS ===');

// Función para crear múltiples transacciones rápidamente
function createMultipleTransactions(count) {
  console.log(`Creando ${count} transacciones...`);
  
  for (let i = 1; i <= count; i++) {
    setTimeout(() => {
      // Simular click en el botón de nueva transacción
      const newTransactionBtn = document.querySelector('[data-testid="new-transaction-btn"]') || 
                               document.querySelector('button:contains("Nueva Transacción")');
      if (newTransactionBtn) {
        newTransactionBtn.click();
        console.log(`Transacción ${i} - Modal abierto`);
      }
    }, i * 1000); // 1 segundo entre cada intento
  }
}

// Función para crear múltiples deudas
function createMultipleDebts(count) {
  console.log(`Creando ${count} deudas...`);
  
  for (let i = 1; i <= count; i++) {
    setTimeout(() => {
      // Simular click en el botón de nueva deuda
      const newDebtBtn = document.querySelector('[data-testid="new-debt-btn"]') || 
                        document.querySelector('button:contains("Nueva Deuda")');
      if (newDebtBtn) {
        newDebtBtn.click();
        console.log(`Deuda ${i} - Modal abierto`);
      }
    }, i * 1000);
  }
}

// Instrucciones
console.log('Para probar los límites:');
console.log('1. createMultipleTransactions(55) - Para probar límite de transacciones');
console.log('2. createMultipleDebts(5) - Para probar límite de deudas');
console.log('3. Observar si aparecen los popups de límite');