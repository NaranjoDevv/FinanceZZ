# Plan de Billing - Sistema de Suscripciones

## Sistema de Administración

### Acceso Seguro para Usuarios No-Admin
- **Fix Implementado**: Los usuarios gratuitos y premium pueden navegar sin errores de autenticación
- **Consulta Segura**: `checkAdminStatus` query no arroja errores para usuarios no-admin
- **Carga Condicional**: Las consultas de admin solo se ejecutan para usuarios con privilegios de administrador
- **Navegación Filtrada**: El elemento "Admin" en la navegación solo aparece para usuarios admin reales

### Configuración de Admin
- Los permisos de admin se asignan manualmente desde el dashboard de Convex
- Los usuarios deben tener `role: "admin"` o `role: "super_admin"` en la base de datos
- El sistema detecta automáticamente el estado de admin sin generar errores

## Versión Gratuita (Free Plan)

### Limitaciones del Plan Gratuito

#### 📊 Transacciones
- **Máximo 10 transacciones por mes**
- Contador se reinicia el primer día de cada mes
- Al alcanzar el límite, se mostrará popup de suscripción

#### 💳 Deudas
- **Máximo 1 deuda activa**
- No se pueden crear más deudas una vez alcanzado el límite
- Popup de suscripción al intentar crear la 2da deuda

#### 🔄 Transacciones Recurrentes
- **Máximo 2 transacciones recurrentes**
- Limitación en la creación de nuevas transacciones recurrentes
- Popup de suscripción al intentar crear la 3ra transacción recurrente

#### 👥 Contactos
- **Módulo completamente deshabilitado**
- No se muestra en la navegación
- Redirección a página de suscripción si se accede directamente

#### 🏷️ Categorías
- **Máximo 2 categorías personalizadas**
- Categorías por defecto del sistema siempre disponibles
- Popup de suscripción al intentar crear la 3ra categoría

#### 📈 Reportes
- **Solo reporte básico de transacciones disponible**
- Reportes avanzados (gráficos, análisis) bloqueados
- Popup de suscripción al intentar acceder a reportes premium

#### 💰 Configuración de Moneda
- **Moneda fija: COP (Peso Colombiano)**
- Selector de moneda deshabilitado
- Popup de suscripción al intentar cambiar moneda

#### 🔢 Formato de Números
- **Formato fijo predeterminado**
- Botón visible pero deshabilitado
- Popup de suscripción al intentar cambiar formato

### Características Incluidas en Plan Gratuito

✅ Dashboard básico con resumen financiero
✅ Gestión básica de transacciones (hasta 10/mes)
✅ Gestión básica de deudas (hasta 1 activa)
✅ Transacciones recurrentes básicas (hasta 2)
✅ Categorías básicas del sistema + 2 personalizadas
✅ Reporte básico de transacciones
✅ Configuración básica de perfil
✅ Recordatorios básicos

## Plan Premium (Futuro)

### Características Premium

🚀 **Transacciones ilimitadas**
🚀 **Deudas ilimitadas**
🚀 **Transacciones recurrentes ilimitadas**
🚀 **Módulo de contactos completo**
🚀 **Categorías ilimitadas**
🚀 **Suite completa de reportes y análisis**
🚀 **Selector de moneda (múltiples divisas)**
🚀 **Personalización de formato de números**
🚀 **Exportación de datos**
🚀 **Backup automático**
🚀 **Soporte prioritario**

### Precio Premium
- **$9.99 USD/mes** o **$99.99 USD/año** (2 meses gratis)

## Implementación Técnica

### Base de Datos
```typescript
// Esquema de usuario con plan
user: {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  planExpiry?: Date;
  limits: {
    monthlyTransactions: number;
    activeDebts: number;
    recurringTransactions: number;
    categories: number;
  };
  usage: {
    currentMonthTransactions: number;
    activeDebts: number;
    recurringTransactions: number;
    categories: number;
    lastResetDate: Date;
  };
}
```

### Middleware de Validación
- Verificar límites antes de crear recursos
- Mostrar popups de suscripción cuando se alcancen límites
- Resetear contadores mensuales automáticamente

### Componentes UI
- `SubscriptionPopup`: Modal para promocionar plan premium
- `PlanBadge`: Indicador del plan actual del usuario
- `UsageMeter`: Medidor de uso para cada límite
- `UpgradeButton`: Botón de actualización a premium

### Rutas Protegidas
- Middleware para verificar acceso a módulos premium
- Redirección automática a página de suscripción

## Fases de Implementación

### Fase 1: Estructura Base
- [x] Crear rama version-free
- [ ] Modificar esquema de base de datos
- [ ] Crear usuario gratuito en seed
- [ ] Implementar middleware de validación

### Fase 2: Limitaciones Core
- [ ] Límites de transacciones
- [ ] Límites de deudas
- [ ] Límites de transacciones recurrentes
- [ ] Límites de categorías

### Fase 3: Restricciones de Módulos
- [ ] Deshabilitar módulo de contactos
- [ ] Minimizar reportes
- [ ] Bloquear configuración de moneda
- [ ] Bloquear formato de números

### Fase 4: UI/UX
- [ ] Popups de suscripción
- [ ] Indicadores de plan
- [ ] Medidores de uso
- [ ] Página de pricing

### Fase 5: Integración de Pagos
- [ ] Integración con Stripe
- [ ] Gestión de suscripciones
- [ ] Webhooks de pagos
- [ ] Actualización automática de planes

---

**Nota**: Este documento será actualizado conforme se implementen las funcionalidades del sistema de billing.