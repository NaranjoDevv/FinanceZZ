# SEMANA 1: Fundación y Arquitectura - Finance Tracker

## Objetivo Principal
Setup completo del proyecto con autenticación funcionando y estructura base implementada.

## Stack Tecnológico a Configurar
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Convex (Backend as a Service)
- **Autenticación**: Clerk con JWT
- **UI Components**: Shadcn/ui (Radix UI + Tailwind)
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod

## Entregables de la Semana 1

### ✅ Día 1-2: Configuración Inicial del Proyecto

#### 1. Instalación de Dependencias Adicionales
```bash
# Instalar Convex
npm install convex

# Instalar Clerk
npm install @clerk/nextjs

# Instalar Framer Motion
npm install framer-motion

# Instalar React Hook Form y Zod
npm install react-hook-form @hookform/resolvers zod

# Instalar Recharts para gráficos
npm install recharts

# Instalar iconos adicionales
npm install @radix-ui/react-icons
```

#### 2. Configuración de Variables de Entorno
Crear archivo `.env.local`:
```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### ✅ Día 2-3: Configuración de Convex y Clerk

#### 3. Inicialización de Convex
```bash
# Inicializar Convex
npx convex dev
```

#### 4. Crear Schema de Base de Datos
**Archivo**: `/convex/schema.ts`
- Definir tablas: users, transactions, debts, categories, subcategories
- Implementar relaciones entre tablas
- Configurar índices para optimización

#### 5. Configuración de Autenticación Clerk-Convex
**Archivo**: `/convex/auth.config.js`
- Configurar JWT template para Convex
- Establecer dominio y audiencia

### ✅ Día 3-4: Estructura de Carpetas y Componentes Base

#### 6. Crear Estructura de Carpetas
```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── debts/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ # Shadcn components
│   ├── dashboard/
│   ├── transactions/
│   ├── debts/
│   ├── analytics/
│   ├── layout/
│   ├── auth/
│   └── providers/
├── hooks/
├── lib/
├── types/
├── constants/
└── utils/
```

#### 7. Configurar Providers
**Archivo**: `/src/components/providers/convex-provider.tsx`
- Integrar ClerkProvider con ConvexProviderWithClerk
- Configurar autenticación JWT

#### 8. Actualizar Layout Principal
**Archivo**: `/src/app/layout.tsx`
- Integrar providers
- Configurar fuentes con next/font
- Implementar theming base

### ✅ Día 4-5: Theming y Estilo "Brutalismo Emocional"

#### 9. Actualizar Globals.css
**Archivo**: `/src/app/globals.css`
- Implementar paleta de colores del "Brutalismo Emocional"
- Configurar variables CSS para modo claro/oscuro
- Añadir variables personalizadas: --income, --expense, --debt

#### 10. Instalar Componentes Shadcn/ui Base
```bash
# Componentes esenciales para la semana 1
npx shadcn-ui add button
npx shadcn-ui add card
npx shadcn-ui add input
npx shadcn-ui add label
npx shadcn-ui add sidebar
npx shadcn-ui add avatar
npx shadcn-ui add dropdown-menu
npx shadcn-ui add separator
```

### ✅ Día 5-6: Implementación de Autenticación

#### 11. Crear Páginas de Autenticación
**Archivos**:
- `/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Implementar diseño minimalista siguiendo principios de Kanye West

#### 12. Configurar Middleware de Autenticación
**Archivo**: `/src/middleware.ts`
- Proteger rutas del dashboard
- Redirigir usuarios no autenticados

#### 13. Crear Funciones de Usuario en Convex
**Archivo**: `/convex/users.ts`
- Mutation para crear/actualizar usuario
- Query para obtener datos del usuario
- Función de onboarding

### ✅ Día 6-7: Layout del Dashboard y Navegación

#### 14. Crear Sidebar Component
**Archivo**: `/src/components/layout/sidebar.tsx`
- Navegación principal del dashboard
- Integrar con Shadcn/ui Sidebar
- Implementar colapso/expansión con Framer Motion

#### 15. Crear Header Component
**Archivo**: `/src/components/layout/header.tsx`
- Información del usuario
- Dropdown de configuraciones
- Toggle de tema claro/oscuro

#### 16. Layout del Dashboard
**Archivo**: `/src/app/(dashboard)/layout.tsx`
- Integrar Sidebar y Header
- Configurar responsive design
- Implementar animaciones de transición

### ✅ Día 7: Páginas Base del Dashboard

#### 17. Página Principal del Dashboard
**Archivo**: `/src/app/(dashboard)/dashboard/page.tsx`
- Estructura base con cards de resumen
- Placeholder para métricas principales
- Implementar fade-in escalonado con Framer Motion

#### 18. Páginas Adicionales (Estructura Base)
**Archivos**:
- `/src/app/(dashboard)/transactions/page.tsx`
- `/src/app/(dashboard)/debts/page.tsx`
- `/src/app/(dashboard)/analytics/page.tsx`
- `/src/app/(dashboard)/settings/page.tsx`

#### 19. Configurar Tipos TypeScript
**Archivo**: `/src/types/index.ts`
- Definir interfaces para User, Transaction, Debt
- Tipos para formularios y API responses

## Criterios de Éxito para Semana 1

### ✅ Funcionalidad
- [ ] Usuario puede registrarse e iniciar sesión
- [ ] Dashboard carga correctamente después del login
- [ ] Navegación entre páginas funciona
- [ ] Tema claro/oscuro funciona
- [ ] Responsive design en móvil y desktop

### ✅ Técnico
- [ ] Convex conectado y funcionando
- [ ] Clerk autenticación configurada
- [ ] Schema de base de datos definido
- [ ] Estructura de carpetas completa
- [ ] TypeScript sin errores
- [ ] Animaciones básicas implementadas

### ✅ Diseño
- [ ] Paleta de colores "Brutalismo Emocional" aplicada
- [ ] Componentes Shadcn/ui integrados
- [ ] Fuentes personalizadas cargadas
- [ ] Layout minimalista y funcional

## Comandos Útiles para la Semana 1

```bash
# Desarrollo
npm run dev
npx convex dev

# Shadcn
npx shadcn-ui add [component]

# Convex
npx convex dashboard
npx convex deploy

# Testing
npm run type-check
npm run lint
```

## Notas Importantes

1. **Rendimiento**: Todas las animaciones deben usar `transform` y `opacity` únicamente
2. **Accesibilidad**: Implementar desde el inicio con ARIA labels
3. **Mobile-First**: Diseñar primero para móvil, luego desktop
4. **Git**: Commits frecuentes con mensajes descriptivos
5. **Documentación**: Comentar funciones complejas con JSDoc

## Próximos Pasos (Semana 2)
- Implementar CRUD de transacciones
- Sistema de categorías
- Validación con Zod
- Formularios con React Hook Form

---

**Fecha de Inicio**: [Fecha]
**Desarrollador**: [Nombre]
**Estado**: 🚀 En Progreso