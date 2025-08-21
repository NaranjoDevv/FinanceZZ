# Guía de Despliegue en Vercel

## 🚨 Error Actual

El error que estás viendo:
```
Error: No address provided to ConvexReactClient.
```

Se debe a que **las variables de entorno no están configuradas en Vercel**.

## ✅ Solución: Configurar Variables de Entorno en Vercel

### Paso 1: Acceder al Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Selecciona tu proyecto `FinanceZZ`
3. Ve a la pestaña **Settings**
4. Selecciona **Environment Variables** en el menú lateral

### Paso 2: Agregar Variables de Entorno

Agrega las siguientes variables **exactamente como aparecen**:

#### Variables de Convex (CRÍTICAS)
```
CONVEX_DEPLOYMENT=dev:quaint-alligator-154
NEXT_PUBLIC_CONVEX_URL=https://quaint-alligator-154.convex.cloud
```

#### Variables de Clerk
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1jcmFuZS00Ni5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_i8zlxjxXLB97OzzLlIOCeJUv5Das76KWzxYfyEDZRs
CLERK_JWT_KEY=convex
CLERK_FRONTEND_API_URL=https://capital-crane-46.clerk.accounts.dev
```

#### Variables de Rutas de Clerk
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Paso 3: Configurar para Todos los Entornos

**IMPORTANTE**: Asegúrate de seleccionar todos los entornos:
- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 4: Redesplegar

Después de agregar las variables:
1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment
3. Haz clic en los tres puntos (...)
4. Selecciona **Redeploy**
5. Asegúrate de marcar **Use existing Build Cache** como `false`

## 🔧 Verificación

### Verificar Variables en Vercel
En el dashboard de Vercel, deberías ver todas estas variables listadas:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL` ⚠️ **MÁS IMPORTANTE**
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Y todas las demás...

### Verificar en el Build Log
Después del redespliegue, el build debería completarse sin el error de Convex.

## 🚨 Problemas Comunes y Soluciones

### Error: "No address provided to ConvexReactClient"
**Causa:** La variable `NEXT_PUBLIC_CONVEX_URL` no está configurada en Vercel.
**Solución:**
1. Verifica que la variable esté configurada en Vercel
2. Asegúrate de que el valor sea correcto (https://your-deployment.convex.cloud)
3. Realiza un redespliegue después de configurar la variable

### Advertencias de ESLint
**Causa:** Importaciones no utilizadas y uso de `<img>` en lugar de `<Image />`.
**Solución:** Ya corregido en el código - se eliminaron importaciones no utilizadas y se reemplazó `<img>` con `<Image />`.

### Advertencia de Lucia Deprecada
**Causa:** El paquete lucia@3.2.2 está deprecado.
**Solución:** Considerar migrar a la nueva versión según la documentación oficial.

### 1. Variables no aparecen
- Asegúrate de hacer clic en **Save** después de cada variable
- Verifica que seleccionaste todos los entornos

### 2. Build sigue fallando
- Haz un **Redeploy** completo (sin cache)
- Verifica que las URLs de Convex sean exactas

### 3. Error de autenticación
- Verifica que las claves de Clerk sean correctas
- Asegúrate de que `CLERK_JWT_KEY=convex` esté configurado

## 🔧 Mejoras Implementadas

- ✅ Manejo mejorado de errores de Convex durante el prerender
- ✅ Componente ConvexClientProvider con inicialización segura
- ✅ Corrección de advertencias de ESLint
- ✅ Reemplazo de `<img>` con `<Image />` de Next.js
- ✅ Configuración de imágenes remotas en next.config.ts
- ✅ Optimización del useMemo en contacts

## 📝 Notas Importantes

1. **Nunca** subas el archivo `.env.local` al repositorio
2. Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente
3. Convex necesita `NEXT_PUBLIC_CONVEX_URL` para funcionar en producción
4. Clerk necesita todas sus variables para la autenticación

## 🎯 Resultado Esperado

Después de configurar correctamente:
- ✅ Build exitoso en Vercel
- ✅ App funcionando en producción
- ✅ Autenticación con Clerk operativa
- ✅ Conexión a Convex establecida

---

**¿Necesitas ayuda?** Verifica que todas las variables estén exactamente como se muestran arriba.