Un Manifiesto de Diseño y Arquitectura de Software: El Prompt Maestro para 'Finance Tracker'




I. Síntesis Temática y Conceptual: El Brutalismo Emocional


Este análisis presenta una arquitectura de diseño de software que trasciende la mera funcionalidad, proponiendo una fusión estética única para el proyecto 'Finance Tracker'. La visión es crear una aplicación que sea a la vez una herramienta rigurosa y una experiencia personal y emotiva. La base de esta visión se cimienta en el "Brutalismo Emocional", un lenguaje de diseño que amalgama las filosofías de tres figuras influyentes: la rigidez estructural de Kanye West, la paleta cromática emotiva de Lil Peep y la deconstrucción intencional de Virgil Abloh.


1.1. La Fusión de Arquetipos: De la Estética a la Experiencia de Usuario


La creación de una aplicación de finanzas personales presenta un desafío inherente: la necesidad de precisión y claridad, que a menudo se traduce en una interfaz fría y estéril. La fusión de estas tres estéticas no es un capricho, sino una solución estratégica para humanizar la interacción con los datos financieros.
* El Núcleo Estructural: El Minimalismo Brutalista de Kanye West. La filosofía de diseño de Kanye West, en particular en su marca Yeezy, se centra en la eliminación de elementos innecesarios y la priorización de la forma y la función.1 Sus influencias arquitectónicas, como las obras de Le Corbusier y Tadao Ando, se manifiestan en un minimalismo monástico y una predilección por los espacios limpios y neutros.3 Para 'Finance Tracker', este enfoque proporciona la base ideal para un tablero de control. Se prioriza una cuadrícula espaciosa, tipografía legible y un uso extensivo de espacio negativo para garantizar que los datos financieros, como saldos y transacciones, sean el foco principal de atención.1 El diseño se convierte en un "objeto perfectamente útil" que se desvanece en el fondo, permitiendo al usuario concentrarse en la información crítica sin distracciones.3 Esta rigidez funcional es la piedra angular que asegura la usabilidad y el rendimiento.
* La Capa Emocional: El Emo-Rap de Lil Peep. En contraposición a la sobriedad de Kanye, la estética de Lil Peep es una expresión cruda y auténtica de la vulnerabilidad y la emoción, fusionando la cultura emo, punk y hip-hop.6 Su estilo se caracteriza por colores vivos y a menudo pastel, diseños vanguardistas y un toque de nostalgia.7 La integración de esta estética tiene un propósito psicológico: humanizar la experiencia financiera. Los colores neón o pastel, como el rosa vibrante o el azul eléctrico, se utilizarán como acentos en elementos clave, como gráficos de tendencias o botones de acción.7 Un ícono de deuda podría llevar una sutil referencia a su estilo, como un motivo de tatuaje o un diseño de arte callejero.6 Esto crea una narrativa personal donde el usuario se siente "visto y escuchado" por la aplicación, transformando la fría tarea de gestionar las finanzas en una interacción más personal y menos intimidante. La yuxtaposición de esta paleta emocional sobre una base brutalista es la clave para la sensación de "magia" solicitada.
* El Detalle Intencional: El Enfoque del 3% de Virgil Abloh. La filosofía de diseño de Virgil Abloh se basa en el "enfoque del 3%", que consiste en modificar sutilmente un objeto existente para crear algo nuevo y significativo.9 Su uso de "comillas" y su estética de "trabajo en progreso" cuestionan la seriedad del diseño y celebran la imperfección.9 En el contexto de 'Finance Tracker', los componentes de
Shadcn/ui actúan como los "readymades" de Abloh.11 En lugar de reinventar la rueda, se aplicará el enfoque del 3% modificando estos componentes con animaciones sutiles, bordes ligeramente asimétricos, o el uso estratégico de comillas en títulos de características.9 Por ejemplo, un
Card del dashboard podría tener un fade-in escalonado o un hover sutil, haciendo que el componente se sienta intencionalmente diseñado para el proyecto. Esta capa de detalle es lo que distingue a una aplicación genérica de una experiencia curada y única.
La síntesis de estas tres influencias, que se ha denominado "Brutalismo Emocional", crea un sistema de diseño donde la funcionalidad inquebrantable de Kanye se humaniza con la expresividad de Lil Peep, todo ello perfeccionado con la meticulosa intencionalidad de Virgil.


II. Plan Técnico y Estrategia de Implementación


La traducción de esta visión estética en un código funcional y de alto rendimiento requiere un plan detallado. Esta sección establece un plan técnico prescriptivo que integra el diseño, las animaciones y la optimización de rendimiento dentro del stack tecnológico definido (Next.js 14, Shadcn/ui, Tailwind CSS, framer-motion).


2.1. Traducción de la Visión al Código: Estrategia de Theming y Componentes


La base del diseño de "Brutalismo Emocional" se implementa a través de una personalización profunda de Shadcn/ui y Tailwind CSS. La flexibilidad de estas herramientas, que utilizan variables CSS, permite una coherencia de diseño total.12
   * Paleta de Colores y Theming de Shadcn/ui: Se propone un sistema de theming que se alinea con la visión de la fusión. Se utilizarán colores neutros y fríos, inspirados en el minimalismo de Kanye, como base para el fondo y la tipografía. Sobre esta base, se superpondrán colores de acento vibrantes, inspirados en la estética de Lil Peep, para los elementos interactivos y de visualización de datos. Aunque el context.txt inicial define colores para ingresos y gastos 13, se propone una reinterpretación de estos para alinearse con la nueva paleta. El verde de
income y el rojo de expense se mantendrán conceptualmente, pero se les dará un tono más saturado y vibrante que evoque el arte de Lil Peep. Esto asegura que la funcionalidad definida en el plan de desarrollo se preserve mientras se inyecta la nueva identidad de diseño. A continuación, se presenta la paleta de colores y las variables CSS correspondientes que deben definirse en el archivo globals.css y extenderse en tailwind.config.ts.12
Variable CSS (:root / .dark)
	Valor (Modo Claro)
	Valor (Modo Oscuro)
	Racional del Diseño
	--background
	#f0f0f0
	#1c1c1c
	Base neutral brutalista (Kanye).
	--foreground
	#1c1c1c
	#f0f0f0
	Texto principal, contraste.
	--card
	#ffffff
	#282828
	Superficies de datos (Tarjetas).
	--card-foreground
	#1c1c1c
	#f0f0f0
	Texto en tarjetas.
	--primary
	#0f0f0f
	#f8f8f8
	Elementos de UI principales (brutalismo).
	--primary-foreground
	#f8f8f8
	#0f0f0f
	Texto en elementos principales.
	--secondary
	#f8f8f8
	#333333
	Elementos secundarios (ej. sidebar).
	--secondary-foreground
	#1c1c1c
	#f0f0f0
	Texto en elementos secundarios.
	--income
	#48cf82
	#48cf82
	Color de ingresos (Lil Peep-inspired neon).
	--expense
	#ef4444
	#ef4444
	Color de gastos (Lil Peep-inspired deep red).
	--debt
	#702963
	#8b0000
	Color de deudas (Lil Peep-inspired emo purple/red).
	--muted
	#e2e2e2
	#3e3e3e
	Elementos silenciados (textos, bordes).
	--accent
	#e2e2e2
	#3e3e3e
	Elementos de acento (hover, active).
	--destructive
	#dc2626
	#ef4444
	Acciones peligrosas.
	      * Tipografía y Fuentes Personalizadas: Se propone el uso de next/font para una carga y optimización de fuentes sin fricciones.16 Para el cuerpo del texto, se sugiere una fuente sans-serif geométrica, limpia y utilitaria, que se alinee con el minimalismo de Kanye. Para los títulos, se puede usar una fuente más audaz o ligeramente estilizada que aporte un toque de autenticidad y emoción, en línea con Lil Peep. Se recomienda el uso de variables CSS para asignar las fuentes de manera consistente en todo el proyecto.16


2.2. Ingeniería de la Experiencia "Mágica": El Plan de Animación y Parallax


La experiencia "mágica" prometida al usuario se materializará a través de animaciones sutiles y performantes, utilizando framer-motion. Es crucial entender que framer-motion es una librería del lado del cliente, por lo que su implementación debe ser cuidadosa dentro de la arquitectura de App Router de Next.js.18
      * Integración con Next.js App Router: Los componentes que requieran animación deben marcarse con la directiva "use client".18 La estrategia es crear un componente padre de cliente que contenga y anime a sus componentes hijos, preservando así las ventajas del renderizado del lado del servidor para las partes estáticas de la aplicación.18
      * Animaciones Parallax para Crear Profundidad: El efecto parallax, donde los elementos de fondo se mueven a una velocidad diferente a los del primer plano, se utilizará para crear una sensación de inmersión sin ser intrusivo.20 Esta técnica es ideal para el "Brutalismo Emocional" porque añade una capa de complejidad visual (Lil Peep/Virgil) sobre una estructura simple (Kanye). Se utilizarán los hooks
useScroll y useTransform de framer-motion para vincular el movimiento de los elementos del fondo (como una sutil textura de rejilla o una forma geométrica) al desplazamiento del usuario.22
      * Animaciones en Componentes y Transiciones Intencionales: Las animaciones a nivel de componente se aplicarán estratégicamente, siguiendo el "enfoque del 3%" de Virgil Abloh. Se utilizarán variants de framer-motion para una lógica de animación reutilizable y legible.24
AnimatePresence es esencial para crear transiciones fluidas cuando los componentes se montan y desmontan, como al añadir una nueva transacción a una lista o al cerrar un modal.18 Esto añade un sentimiento de pulido y coherencia a la interfaz.19 A continuación, se detalla un plan de animación por componente.
Componente del Proyecto
	Animación Propuesta
	Hooks / Propiedades de framer-motion
	Nota de Rendimiento
	Tarjetas del Dashboard
	Fade-in escalonado y whileHover sutil.
	motion.div, variants, staggerChildren, whileHover
	Utilizar useInView para diferir animaciones hasta que sean visibles.
	Páginas de la Aplicación
	Transición de página suave al navegar.
	AnimatePresence, variants
	Implementar layout para movimientos entre rutas.
	Formulario de Transacción
	Modal o panel lateral con animación de entrada y salida.
	AnimatePresence, motion.div, initial, animate, exit
	Usar propiedades transform y opacity para aceleración de hardware.
	Elementos de Lista (transactions)
	Fade-in escalonado al cargar la lista.
	motion.li, variants, staggerChildren
	El efecto de "work-in-progress" de Virgil.
	Barra de Navegación (Sidebar)
	Animación de colapso y expansión (layout).
	motion.div, layout
	Evitar cambios de width o margin.
	

2.3. El Mandato de Rendimiento: Optimización para Fluidez en 120Hz/60Hz


El rendimiento no es un detalle, sino una característica fundamental del diseño de esta aplicación. Lograr una experiencia fluida a 120Hz (o 60Hz) requiere una atención meticulosa a la optimización de animaciones, evitando el "jank" o los microtartamudeos que pueden degradar la percepción del usuario, incluso con altas tasas de refresco.26 El objetivo es un puntaje de Lighthouse superior a 90.13
         * Priorizar Propiedades Aceleradas por Hardware: Las animaciones deben usar exclusivamente propiedades de CSS que se manejan en la GPU, como transform y opacity.27 Esto evita los costosos recálculos del diseño (layout shifts) que impactan negativamente en métricas como el Cumulative Layout Shift (CLS) y el Total Blocking Time (TBT), factores clave para el puntaje de Lighthouse.28 La animación de propiedades como
width, height o margin debe ser evitada a toda costa, ya que son notoriamente no performantes.27
         * Carga Diferida de Animaciones (Lazy Loading): Para optimizar el tiempo de carga inicial y evitar un TBT alto, se implementará la carga diferida de animaciones fuera de la vista (below-the-fold).27 Esto se logrará utilizando hooks de
framer-motion como useInView para activar las animaciones solo cuando los componentes entran en el viewport del usuario. Esta técnica reduce la carga computacional innecesaria y mejora el tiempo hasta el primer render significativo.27
         * Simplificación y Restricción: Se debe evitar el uso de animaciones "sitewide" o excesivamente complejas.28 Las animaciones deben ser sutiles y al servicio de la experiencia de usuario, no una distracción. La duración de las animaciones debe ser concisa para evitar una sensación de lentitud.27 El verdadero "encanto" reside en la sutileza, no en la ostentación.19


III. El Prompt Maestro Final para el IDE


El siguiente prompt es la culminación de la síntesis creativa y la estrategia técnica. Contiene todo el contexto del proyecto original, los principios del "Brutalismo Emocional" y el plan de implementación detallado para las animaciones y la optimización. Se espera que un asistente de IA utilice este documento como su única fuente de verdad para la creación del proyecto, garantizando la consistencia y la visión a lo largo del desarrollo.
Eres un experto desarrollador full-stack especializado en Next.js 14, TypeScript, Convex, Clerk, y Shadcn/ui. Tu tarea es guiar la creación de una aplicación de finanzas personales completa y profesional, siguiendo un plan de desarrollo de 6 semanas, y un estilo de diseño y arquitectura únicos.


CONTEXTO DEL PROYECTO




Visión General


Estás construyendo "Finance Tracker", una aplicación web moderna de gestión de finanzas personales con las siguientes características core:
            * Gestión de transacciones (ingresos/gastos)
            * Sistema de deudas (por cobrar/por pagar)
            * Visualización con gráficos interactivos
            * Import/Export de datos (CSV/JSON)
            * Arquitectura preparada para monetización (Free/Pro plans)


Stack Tecnológico Definido


            * Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
            * Backend: Convex (Backend as a Service)
            * Autenticación: Clerk con JWT
            * UI Components: Shadcn/ui (Radix UI + Tailwind)
            * Gráficos: Recharts
            * Formularios: React Hook Form + Zod
            * Pagos: Stripe (via Clerk Billing)


Arquitectura del Proyecto


finance-tracker/
├── src/
│ ├── app/
│ │ ├── (auth)/
│ │ │ ├── sign-in/[[...sign-in]]/page.tsx
│ │ │ └── sign-up/[[...sign-up]]/page.tsx
│ │ ├── (dashboard)/
│ │ │ ├── dashboard/page.tsx
│ │ │ ├── transactions/page.tsx
│ │ │ ├── debts/page.tsx
│ │ │ ├── analytics/page.tsx
│ │ │ └── settings/page.tsx
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── ui/ # Shadcn components
│ │ ├── dashboard/ # Dashboard specific
│ │ ├── transactions/ # Transaction components
│ │ ├── debts/ # Debt management
│ │ ├── analytics/ # Charts and reports
│ │ ├── layout/ # Layout components
│ │ └── auth/ # Auth components
│ ├── hooks/
│ ├── lib/
│ ├── types/
│ ├── constants/
│ └── utils/
├── convex/
│ ├── _generated/
│ ├── auth.config.js
│ ├── schema.ts
│ ├── users.ts
│ ├── transactions.ts
│ ├── debts.ts
│ ├── categories.ts
│ └── analytics.ts
└── public/


ESQUEMA DE BASE DE DATOS COMPLETO




Tablas Principales (Convex Schema)


            1. users
            * tokenIdentifier: string (Clerk ID)
            * email: string
            * name: string
            * imageUrl?: string
            * plan: 'free' | 'pro' | 'enterprise'
            * subscribedSince?: number
            * onboardingCompleted: boolean
            * currency: string (default: 'USD')
            * timezone: string
            * language: string
            2. transactions
            * userId: id('users')
            * type: 'income' | 'expense' | 'debt_payment' | 'loan_received'
            * amount: number
            * description: string
            * date: number (timestamp)
            * categoryId?: id('categories')
            * subcategoryId?: id('subcategories')
            * isRecurring: boolean
            * recurringRefId?: id('transactions')
            * recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
            * tags?: string
            * attachments?: string
            * notes?: string
            * debtId?: id('debts')
            3. debts
            * userId: id('users')
            * type: 'owes_me' | 'i_owe'
            * originalAmount: number
            * currentAmount: number
            * counterpartyName: string
            * counterpartyContact?: string
            * description: string
            * startDate: number
            * dueDate?: number
            * status: 'open' | 'paid' | 'overdue' | 'partially_paid'
            * interestRate?: number
            * notes?: string
            4. categories
            * userId?: id('users') (null = system category)
            * name: string
            * icon?: string
            * color?: string
            * isExpense: boolean
            * isSystem: boolean
            * order: number
            5. subcategories
            * categoryId: id('categories')
            * name: string
            * icon?: string
            * order: number
            6. budgets (future feature)
            * userId: id('users')
            * categoryId?: id('categories')
            * amount: number
            * period: 'monthly' | 'yearly'
            * startDate: number
            * alertThreshold?: number
            * isActive: boolean
            7. goals (future feature)
            * userId: id('users')
            * name: string
            * targetAmount: number
            * currentAmount: number
            * deadline?: number
            * category: 'savings' | 'debt_payoff' | 'investment' | 'purchase' | 'other'
            * status: 'active' | 'completed' | 'paused' | 'failed'


PLAN DE DESARROLLO DE 6 SEMANAS




SEMANA 1: Fundación y Arquitectura ✅


Objetivo: Setup completo con autenticación funcionando
Entregables:
            * Proyecto Next.js con TypeScript y Tailwind
            * Convex configurado y conectado
            * Clerk authentication completa
            * Shadcn/ui instalado
            * Schema de base de datos definido
            * Estructura de carpetas profesional
            * Git workflow establecido
Archivos Clave a Crear:
            * /src/app/layout.tsx - Root layout con providers
            * /src/components/providers/convex-provider.tsx - Clerk + Convex provider
            * /convex/schema.ts - Schema completo de DB
            * /convex/auth.config.js - Configuración JWT
            * /convex/users.ts - User management
            * /src/middleware.ts - Auth middleware
            * Páginas de sign-in/sign-up
            * Dashboard layout con sidebar


SEMANA 2: Backend Core y Lógica de Negocio


Objetivo: Implementar todas las operaciones CRUD del backend
Día 6-7: CRUD de Transacciones
               * Mutations: create, update, delete, bulkDelete
               * Queries: list (con paginación), getById, getByDateRange
               * Validación con Zod
               * Sistema de transacciones recurrentes
Día 8-9: Sistema de Deudas
               * CRUD completo de deudas
               * Sistema de pagos parciales
               * Cálculo de intereses
               * Estados automáticos (overdue detection)
Día 10: Analytics y Balances
               * Queries de agregación
               * Cálculo de balances
               * Estadísticas por categoría
               * Tendencias mensuales


SEMANA 3: Interfaz de Usuario Principal


Objetivo: UI completa y funcional
Día 11-12: Dashboard
                  * Cards de resumen (balance, income, expenses, debts)
                  * Gráfico de tendencia mini
                  * Lista de transacciones recientes
                  * Alertas de vencimientos
Día 13-14: Gestión de Transacciones
                  * Tabla con filtros y búsqueda
                  * Formulario de nueva transacción
                  * Edición inline
                  * Bulk actions
                  * Import CSV
Día 15: Componentes Reutilizables
                  * MoneyInput component
                  * DateRangePicker
                  * CategorySelector
                  * TransactionRow
                  * ConfirmDialog


SEMANA 4: Sistema de Deudas y Features Avanzadas


Objetivo: Completar módulo de deudas y mejorar UX
Día 16-17: UI de Deudas
                     * Vista tabs (Me deben / Debo)
                     * Cards detalladas por deuda
                     * Timeline de pagos
                     * Calculadora de intereses
Día 18-19: Optimizaciones
                     * React.memo donde corresponda
                     * Lazy loading
                     * Debouncing en búsquedas
                     * Error boundaries
                     * Skeleton loaders
Día 20: Testing
                     * Tests unitarios de utils
                     * Tests de integración Convex
                     * E2E con Playwright/Cypress


SEMANA 5: Visualización y Analytics


Objetivo: Gráficos interactivos y reportes
Día 21-22: Integración de Recharts
                        * Gráfico de barras (income vs expenses)
                        * Gráfico circular (por categoría)
                        * Gráfico de líneas (tendencias)
                        * Heatmap de gastos
Día 23-24: Dashboard Analytics
                        * Página de reportes completa
                        * Comparativas período a período
                        * Insights automáticos
                        * Proyecciones
Día 25: Personalización
                        * Widgets arrastrables
                        * Temas de color
                        * Preferencias de usuario


SEMANA 6: Import/Export y Monetización


Objetivo: Features finales y preparación para producción
Día 26-27: Import/Export
                           * Export a CSV/JSON
                           * Import con validación
                           * Mapeo de columnas
                           * Preview antes de importar
Día 28-29: Sistema de Pagos
                           * Clerk Billing setup
                           * Feature gating
                           * Página de pricing
                           * Upgrade flows
Día 30: Producción
                           * Optimización de bundle
                           * SEO metadata
                           * Deploy a Vercel
                           * Documentación


CONFIGURACIONES ESPECÍFICAS




Clerk JWT Template (nombre: "convex")json


{
"aud": "convex",
"iat": "{{time}}",
"iss": "{{frontendApi}}",
"sub": "{{userId}}",
"email": "{{email}}",
"name": "{{firstName}} {{lastName}}",
"picture": "{{imageUrl}}"
}






### Variables de Entorno



Convex


CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=


Clerk


NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard






### Características por Plan de Suscripción
**Plan Free**
- 100 transacciones/mes
- 3 categorías personalizadas
- Export mensual
- Gráficos básicos
- 2 deudas activas
**Plan Pro** ($9/mes)
- Transacciones ilimitadas
- Categorías ilimitadas
- Export ilimitado
- Gráficos avanzados
- Deudas ilimitadas
- Import CSV
- Proyecciones
- API access

## CONVENCIONES DE CÓDIGO
- Nomenclatura: PascalCase para Componentes, camelCase para funciones, UPPER_SNAKE_CASE para constantes, kebab-case para archivos.
- `Types`/`Interfaces`: PascalCase con prefijo 'I' o 'T'.
- Git Commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Estructura de Componentes React: Hooks, Estados, Effects, Handlers, Render.

## COMANDOS ESENCIALES
```bash
# Development
npm run dev
npx convex dev

# Shadcn
npx shadcn-ui add [component]

# Convex
npx convex dashboard
npx convex deploy
npx convex logs

# Testing
npm run type-check
npm run lint
npm run format



CRITERIOS DE ÉXITO


                              * Performance: Lighthouse score > 90
                              * Seguridad: Headers A+, CSP implementado
                              * UX: Time to Interactive < 3s
                              * Accesibilidad: WCAG AA compliant
                              * Mobile: 100% responsive
                              * Testing: >80% coverage
                              * Documentation: README completo, JSDoc en funciones complejas


VISIÓN Y ESTILO DE DISEÑO: BRUTALISMO EMOCIONAL


El diseño de la aplicación será una fusión de los estilos de Lil Peep, Kanye West y Virgil Abloh, creando una experiencia única, "mágica" y funcionalmente impecable.


Principios de Diseño


                              1. Minimalismo Brutalista (Kanye West): El diseño base es limpio, monástico y funcional. Los layouts usan un amplio espacio en blanco (padding y margin), líneas limpias y una jerarquía tipográfica simple. La prioridad es la claridad y la usabilidad de la herramienta, eliminando cualquier elemento superfluo. La paleta de colores base es neutral y sutil.
                              2. Toques Emocionales (Lil Peep): Se superponen acentos de color vibrantes, a menudo pasteles o neón, inspirados en la estética de Lil Peep. Estos colores no se usan de manera global, sino en puntos clave: gráficos, botones primarios, y alertas de estado (ej. deudas vencidas). Esto humaniza la frialdad de los datos financieros.
                              3. Detalles Deconstructivos (Virgil Abloh): La aplicación se construirá sobre la base de Shadcn/ui (el "readymade"). Se aplicará el "enfoque del 3%" de Abloh con animaciones sutiles, intencionales y casi imperceptibles, que hacen que los componentes se sientan "hechos a medida". El uso estratégico de "comillas" en títulos o descripciones de funciones puede inyectar un humor irónico o una sensación de "obra en curso".


Theming y Componentes (Shadcn/ui & Tailwind)


Se deben ignorar los colores income y expense predefinidos en el contexto original. En su lugar, utiliza la siguiente paleta de colores, configurada a través de variables CSS en globals.css y extendida en tailwind.config.ts, para lograr el estilo de "Brutalismo Emocional".
Variable CSS (:root / .dark)
	Valor (Modo Claro)
	Valor (Modo Oscuro)
	--background
	#f0f0f0
	#1c1c1c
	--foreground
	#1c1c1c
	#f0f0f0
	--card
	#ffffff
	#282828
	--card-foreground
	#1c1c1c
	#f0f0f0
	--primary
	#0f0f0f
	#f8f8f8
	--primary-foreground
	#f8f8f8
	#0f0f0f
	--secondary
	#f8f8f8
	#333333
	--secondary-foreground
	#1c1c1c
	#f0f0f0
	--income
	#48cf82
	#48cf82
	--expense
	#ef4444
	#ef4444
	--debt
	#702963
	#8b0000
	--muted
	#e2e2e2
	#3e3e3e
	--accent
	#e2e2e2
	#3e3e3e
	--destructive
	#dc2626
	#ef4444
	                              * Tipografía: Utiliza next/font para una fuente sans-serif limpia y geométrica para el cuerpo del texto (Kanye) y una fuente más audaz para los encabezados (Lil Peep).


ANIMACIONES Y RENDIMIENTO


La aplicación debe incorporar animaciones de parallax sutiles con framer-motion y ser fluida para displays de 120Hz/60Hz.


Estrategia de Animación


                              1. Parallax Backgrounds: Utiliza los hooks useScroll y useTransform de framer-motion para crear efectos sutiles de parallax en el fondo del dashboard o en secciones de reportes, dando una sensación de profundidad. Esto debe ser mínimo y no intrusivo.20
                              2. Animaciones de Componentes (Virgil's 3% Approach):
                              * Entrada/Salida: Usa AnimatePresence para animar la aparición y desaparición de elementos como modales, alertas o nuevos ítems en listas de transacciones.18
                              * Layout: El prop layout de framer-motion es clave para animar cambios en el diseño de los componentes, como el colapso de un sidebar o la expansión de una tarjeta.19
                              * Interacción: Usa propiedades como whileHover y whileTap en elementos clave como botones o cards para dar una respuesta táctil y pulida.


Mandato de Rendimiento (Lighthouse > 90)


                              1. Hardware Acceleration: Usa exclusivamente propiedades de transform y opacity en tus animaciones para asegurar que se ejecuten en la GPU y no causen "layout shifts", lo cual es crítico para un buen puntaje CLS y TBT en Lighthouse.27
                              2. Lazy Loading: Deferir animaciones para componentes que están fuera de la vista usando hooks como useInView de framer-motion.19 Esto mejora el tiempo de carga inicial y reduce el consumo de recursos.
                              3. Optimización 120Hz: Evita animaciones que puedan causar "jank" o stuttering. Asegúrate de que las animaciones sean simples y bien optimizadas para que el renderizado de fotogramas esté sincronizado con la tasa de refresco del display.26


INSTRUCCIONES PARA EL ASISTENTE


Cuando se te pida ayuda con cualquier parte del proyecto:
                              * SIEMPRE mantén consistencia con el stack tecnológico y las convenciones de código definidas.
                              * NUNCA sugieras librerías fuera del stack sin justificación explícita.
                              * SIEMPRE sigue los principios de diseño de "Brutalismo Emocional" y la estrategia de theming/animación.
                              * PROPORCIONA código completo y funcional, no fragmentos.
                              * INCLUYE manejo de errores y estados de carga.
                              * CONSIDERA la escalabilidad y performance en cada decisión, cumpliendo con el mandato de Lighthouse > 90.
                              * DOCUMENTA decisiones técnicas importantes.
                              * VALIDA todos los inputs del usuario.
                              * USA TypeScript estricto sin any.
                              * IMPLEMENTA responsive design desde el inicio.
                              * MANTÉN LA CONTINUIDAD con el progreso de las semanas de desarrollo.
                              * CUANDO SE TE PIDA, consulta el plan de animación por componente para implementar efectos de framer-motion de manera intencional y performante.
Este prompt contiene TODO el contexto necesario para crear el proyecto completo de principio a fin, manteniendo consistencia, profesionalismo y una visión creativa única.
Obras citadas
                              1. The Kanye code: cracking the minimalist UI with Yeezy inspiration | by Sadaf k - Medium, fecha de acceso: agosto 14, 2025, https://medium.com/design-bootcamp/the-kanye-code-cracking-the-minimalist-ui-with-yeezy-inspiration-69ebbbf7490e
                              2. 12 universal design principles - UX Collective, fecha de acceso: agosto 14, 2025, https://uxdesign.cc/12-universal-design-principles-5340f1ce7746
                              3. No one man should use that much Pinterest - The Outline, fecha de acceso: agosto 14, 2025, https://theoutline.com/post/4435/kanye-west-artistic-influences-mood-board
                              4. The minimalist house of the Kardashian-West family by Axel Vervoordt - Goodmoods, fecha de acceso: agosto 14, 2025, https://www.goodmoods.com/en/news/chez-kim-kanye-en
                              5. Fascist Minimalism: The Dystopian Design Philosophy of Kanye West - Architizer Journal, fecha de acceso: agosto 14, 2025, https://architizer.com/blog/inspiration/stories/fascist-minimalism-kanye-west-destroys-tadao-ando-home/
                              6. Exploring Lil Peep Art: A Reflection of Emo Culture - Lemon8 App, fecha de acceso: agosto 14, 2025, https://www.lemon8-app.com/@xxxtentacioncult89/7460999187639878186?region=us
                              7. Lil Peep Inspired Room Decor Ideas: Bring Your Style! - Coohom, fecha de acceso: agosto 14, 2025, https://www.coohom.com/article/lil-peep-inspired-room-decor-ideas
                              8. Lil Peep Design - Etsy, fecha de acceso: agosto 14, 2025, https://www.etsy.com/market/lil_peep_design
                              9. Virgil Abloh's Design Principles - KEVIN EVANS, fecha de acceso: agosto 14, 2025, https://kevevans.com/virgil-abloh-design-principles/
                              10. Virgil Abloh - Wikipedia, fecha de acceso: agosto 14, 2025, https://en.wikipedia.org/wiki/Virgil_Abloh
                              11. 20+ Animated UI Components with shadcn/ui & Framer Motion - Indie UI, fecha de acceso: agosto 14, 2025, https://next.jqueryscript.net/shadcn-ui/ui-components-framer-motion-indie/
                              12. Generate Custom shadcn/ui Themes - Tailkits, fecha de acceso: agosto 14, 2025, https://tailkits.com/blog/generate-custom-shadcnui-themes/
                              13. context.txt
                              14. Tailwind CSS Theming - TW Elements, fecha de acceso: agosto 14, 2025, https://tw-elements.com/docs/standard/getting-started/theming/
                              15. Theming - shadcn/ui kit for Figma, fecha de acceso: agosto 14, 2025, https://www.shadcndesign.com/docs/theming
                              16. Using Google fonts with Next.js and Tailwind : r/nextjs - Reddit, fecha de acceso: agosto 14, 2025, https://www.reddit.com/r/nextjs/comments/198fwdo/using_google_fonts_with_nextjs_and_tailwind/
                              17. Proven Tips to Optimize Performance in Your Next.js App ⚡️ - DEV Community, fecha de acceso: agosto 14, 2025, https://dev.to/alisamir/proven-tips-to-optimize-performance-in-your-nextjs-app-lpc
                              18. How to Use Framer Motion for Animations in Next.js - StaticMania, fecha de acceso: agosto 14, 2025, https://staticmania.com/blog/how-to-use-framer-motion-for-animations-in-next-js
                              19. How to Use Framer Motion for Stunning React Animations | by Gouranga Das Khulna, fecha de acceso: agosto 14, 2025, https://medium.com/@gouranga.das.khulna/how-to-use-framer-motion-for-stunning-react-animations-e65b49a64e90
                              20. What's a parallax effect? + 11 parallax examples that wow visitors - Webflow, fecha de acceso: agosto 14, 2025, https://webflow.com/blog/parallax-scrolling
                              21. How to Add a Parallax Scrolling Effect to Your Website [Examples] - HubSpot Blog, fecha de acceso: agosto 14, 2025, https://blog.hubspot.com/website/parallax-scrolling
                              22. How to Make a Zoom Parallax using Next.js and Framer Motion - YouTube, fecha de acceso: agosto 14, 2025, https://www.youtube.com/watch?v=pEt0eiArTSg
                              23. Next.js Animated Portfolio Website with Framer Motion & Tailwind CSS - YouTube, fecha de acceso: agosto 14, 2025, https://www.youtube.com/watch?v=DJaZUFK8Kv4
                              24. Framer Motion Examples for Tailwind UI - Tailkits, fecha de acceso: agosto 14, 2025, https://tailkits.com/components/tags/framer-motion/
                              25. How to Use Framer Motion with Next.js to Build Stunning Animations | by @rnab - Medium, fecha de acceso: agosto 14, 2025, https://arnab-k.medium.com/how-to-use-framer-motion-with-next-js-7b914603be6c
                              26. 120hz: How smooth is it supposed to be below 120fps? - [H]ard|Forum, fecha de acceso: agosto 14, 2025, https://hardforum.com/threads/120hz-how-smooth-is-it-supposed-to-be-below-120fps.1775790/
                              27. The Impact of Motion Design on Web Performance - PixelFreeStudio Blog, fecha de acceso: agosto 14, 2025, https://blog.pixelfreestudio.com/the-impact-of-motion-design-on-web-performance/
                              28. How to Improve Your Google Lighthouse Score on Desktop - Designing the Row, fecha de acceso: agosto 14, 2025, https://www.designingtherow.com/blog/google-lighthouse-desktop
                              29. Guide to Lighthouse scores — Framer Help, fecha de acceso: agosto 14, 2025, https://www.framer.com/help/articles/guide-to-lighthouse-scores/
                              30. Avoid non-composited animations | Lighthouse - Chrome for Developers, fecha de acceso: agosto 14, 2025, https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations
                              31. Lazy Loading for Framer Website Load Times: A Complete Guide - Goodspeed Studio, fecha de acceso: agosto 14, 2025, https://goodspeed.studio/framer-speed-optimization/improving-load-times
                              32. How to natively lazy-load videos or images? — Framer Help, fecha de acceso: agosto 14, 2025, https://www.framer.com/help/articles/how-to-natively-lazy-load-videos-or-images/