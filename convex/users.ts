import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query para obtener el usuario actual
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    console.log("🔍 getCurrentUser called");
    
    const identity = await ctx.auth.getUserIdentity();
    console.log("👤 Identity:", identity ? { tokenIdentifier: identity.tokenIdentifier, email: identity.email } : null);
    
    if (!identity) {
      console.log("❌ No identity found");
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    console.log("👥 User found:", user ? { _id: user._id, email: user.email } : null);
    
    // Proporcionar valor por defecto para numberRounding si no existe
    if (user && user.numberRounding === undefined) {
      return {
        ...user,
        numberRounding: false
      };
    }
    
    return user;
  },
});

// Mutation para migrar usuarios existentes que no tengan numberRounding
export const migrateUserNumberRounding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Migrar campos faltantes
    const updates: any = {};
    
    if (user.numberRounding === undefined) {
      updates.numberRounding = false;
    }
    
    if (!user.limits) {
      updates.limits = {
        monthlyTransactions: 10,
        activeDebts: 1,
        recurringTransactions: 2,
        categories: 2
      };
    }
    
    if (!user.usage) {
      updates.usage = {
        monthlyTransactions: 0,
        activeDebts: 0,
        recurringTransactions: 0,
        categories: 0,
        lastResetDate: Date.now()
      };
    }
    
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }
    
    return { migrated: Object.keys(updates).length > 0, fields: Object.keys(updates) };
  },
});

// Mutation para migrar todos los usuarios a los nuevos límites (solo para admin)
export const migrateUserLimitsToNew = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;
    
    for (const user of users) {
      if (user.plan === "free" && user.limits) {
        // Update to new free plan limits
        const newLimits = {
          monthlyTransactions: 10,
          activeDebts: 1,
          recurringTransactions: 2,
          categories: 2
        };
        
        // Only update if limits are different
        if (user.limits.monthlyTransactions !== 10 || 
            user.limits.activeDebts !== 1 || 
            user.limits.categories !== 2) {
          await ctx.db.patch(user._id, {
            limits: newLimits
          });
          migratedCount++;
        }
      }
    }
    
    return { 
      totalUsers: users.length, 
      migratedUsers: migratedCount,
      message: `Migrated ${migratedCount} users to new free plan limits (10 transactions, 1 debt, 2 categories)`
    };
  },
});

// Mutation para actualizar configuración de redondeo
export const updateUserNumberRounding = mutation({
  args: {
    numberRounding: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      numberRounding: args.numberRounding,
    });

    return { success: true };
  },
});

// Mutation para crear o actualizar usuario
export const createOrUpdateUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (existingUser) {
      // Actualizar usuario existente y asegurar que tenga el campo numberRounding
      const updateData: any = {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      };
      
      // Si el usuario no tiene el campo numberRounding, agregarlo
      if (existingUser.numberRounding === undefined) {
        updateData.numberRounding = false;
      }
      
      await ctx.db.patch(existingUser._id, updateData);
      return existingUser._id;
    } else {
      // Crear nuevo usuario
      const userData: {
        tokenIdentifier: string;
        email: string;
        name: string;
        plan: "free" | "premium";
        onboardingCompleted: boolean;
        currency: string;
        numberRounding: boolean;
        timezone: string;
        language: string;
        limits: {
          monthlyTransactions: number;
          activeDebts: number;
          recurringTransactions: number;
          categories: number;
        };
        usage: {
          monthlyTransactions: number;
          activeDebts: number;
          recurringTransactions: number;
          categories: number;
          lastResetDate: number;
        };
        imageUrl?: string;
      } = {
        tokenIdentifier: args.tokenIdentifier,
        email: args.email,
        name: args.name,
        plan: "free",
        onboardingCompleted: false,
        currency: "COP", // Moneda por defecto para usuarios gratuitos
        numberRounding: false,
        timezone: "UTC",
        language: "es", // Idioma por defecto español
        limits: {
          monthlyTransactions: 10,
          activeDebts: 1,
          recurringTransactions: 2,
          categories: 2
        },
        usage: {
          monthlyTransactions: 0,
          activeDebts: 0,
          recurringTransactions: 0,
          categories: 0,
          lastResetDate: Date.now()
        }
      };

      if (args.imageUrl) userData.imageUrl = args.imageUrl;

      const userId = await ctx.db.insert("users", userData);
      return userId;
    }
  },
});

// Mutation para completar onboarding
export const completeOnboarding = mutation({
  args: {
    currency: v.string(),
    timezone: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuario no autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.patch(user._id, {
      currency: args.currency,
      timezone: args.timezone,
      language: args.language,
      onboardingCompleted: true,
    });

    return user._id;
  },
});

// Mutation para actualizar configuración de moneda
export const updateUserCurrency = mutation({
  args: {
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuario no autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.patch(user._id, {
      currency: args.currency,
    });

    return user._id;
  },
});

// Mutation para actualizar plan de suscripción
export const updateUserPlan = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuario no autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const updateData: {
      plan: "free" | "premium";
      subscribedSince?: number;
    } = {
      plan: args.plan,
    };

    if (args.plan !== "free") {
      updateData.subscribedSince = Date.now();
    }

    await ctx.db.patch(user._id, updateData);

    return user._id;
  },
});

// ===== NUEVAS FUNCIONES DE FACTURACIÓN =====

// Obtener información de facturación del usuario
export const getUserBillingInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    return {
      plan: user.plan,
      planExpiry: user.planExpiry,
      limits: user.limits,
      usage: user.usage
    };
  },
});

// Verificar límites del usuario
export const checkUserLimits = mutation({
  args: {
    userId: v.id("users"),
    limitType: v.union(
      v.literal("transactions"),
      v.literal("debts"),
      v.literal("recurring_transactions"),
      v.literal("categories")
    )
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Si es premium, siempre puede proceder
    if (user.plan === "premium") {
      return {
        canProceed: true,
        currentUsage: 0,
        limit: 0,
        message: "Usuario premium - sin límites"
      };
    }

    // Verificar límites para usuarios gratuitos
    const { limits, usage } = user;
    if (!limits || !usage) {
      throw new Error("Límites o uso no configurados para el usuario");
    }

    let currentUsage: number;
    let limit: number;
    let message: string;

    switch (args.limitType) {
      case "transactions":
        currentUsage = usage.monthlyTransactions;
        limit = limits.monthlyTransactions;
        message = `Has usado ${currentUsage} de ${limit} transacciones este mes`;
        break;
      case "debts":
        currentUsage = usage.activeDebts;
        limit = limits.activeDebts;
        message = `Tienes ${currentUsage} de ${limit} deudas activas`;
        break;
      case "recurring_transactions":
        currentUsage = usage.recurringTransactions;
        limit = limits.recurringTransactions;
        message = `Tienes ${currentUsage} de ${limit} transacciones recurrentes`;
        break;
      case "categories":
        currentUsage = usage.categories;
        limit = limits.categories;
        message = `Tienes ${currentUsage} de ${limit} categorías personalizadas`;
        break;
      default:
        throw new Error("Tipo de límite no válido");
    }

    const canProceed = currentUsage < limit;

    return {
      canProceed,
      currentUsage,
      limit,
      message: canProceed ? message : `Límite alcanzado: ${message}`
    };
  },
});

// Incrementar uso
export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    limitType: v.union(
      v.literal("transactions"),
      v.literal("debts"),
      v.literal("recurring_transactions"),
      v.literal("categories")
    ),
    increment: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const increment = args.increment || 1;
    
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // No incrementar para usuarios premium
    if (user.plan === "premium") {
      return;
    }

    if (!user.usage) {
      throw new Error("Uso no configurado para el usuario");
    }

    const newUsage = { ...user.usage };

    switch (args.limitType) {
      case "transactions":
        newUsage.monthlyTransactions += increment;
        break;
      case "debts":
        newUsage.activeDebts += increment;
        break;
      case "recurring_transactions":
        newUsage.recurringTransactions += increment;
        break;
      case "categories":
        newUsage.categories += increment;
        break;
    }

    await ctx.db.patch(user._id, { usage: newUsage });
  },
});

// Decrementar uso
export const decrementUsage = mutation({
  args: {
    userId: v.id("users"),
    limitType: v.union(
      v.literal("transactions"),
      v.literal("debts"),
      v.literal("recurring_transactions"),
      v.literal("categories")
    ),
    decrement: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const decrement = args.decrement || 1;
    
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // No decrementar para usuarios premium
    if (user.plan === "premium") {
      return;
    }

    if (!user.usage) {
      throw new Error("Uso no configurado para el usuario");
    }

    const newUsage = { ...user.usage };

    switch (args.limitType) {
      case "transactions":
        newUsage.monthlyTransactions = Math.max(0, newUsage.monthlyTransactions - decrement);
        break;
      case "debts":
        newUsage.activeDebts = Math.max(0, newUsage.activeDebts - decrement);
        break;
      case "recurring_transactions":
        newUsage.recurringTransactions = Math.max(0, newUsage.recurringTransactions - decrement);
        break;
      case "categories":
        newUsage.categories = Math.max(0, newUsage.categories - decrement);
        break;
    }

    await ctx.db.patch(user._id, { usage: newUsage });
  },
});

// Obtener estadísticas de uso del usuario
export const getUserUsageStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    const { limits, usage, plan } = user;

    if (plan === "premium") {
      return {
        plan,
        stats: [
          { name: "Transacciones", current: "Ilimitado", limit: "Ilimitado", percentage: 0 },
          { name: "Deudas", current: "Ilimitado", limit: "Ilimitado", percentage: 0 },
          { name: "Recurrentes", current: "Ilimitado", limit: "Ilimitado", percentage: 0 },
          { name: "Categorías", current: "Ilimitado", limit: "Ilimitado", percentage: 0 }
        ]
      };
    }

    if (!limits || !usage) {
      return {
        plan,
        stats: []
      };
    }

    return {
      plan,
      stats: [
        {
          name: "Transacciones",
          current: usage.monthlyTransactions,
          limit: limits.monthlyTransactions,
          percentage: (usage.monthlyTransactions / limits.monthlyTransactions) * 100
        },
        {
          name: "Deudas",
          current: usage.activeDebts,
          limit: limits.activeDebts,
          percentage: (usage.activeDebts / limits.activeDebts) * 100
        },
        {
          name: "Recurrentes",
          current: usage.recurringTransactions,
          limit: limits.recurringTransactions,
          percentage: (usage.recurringTransactions / limits.recurringTransactions) * 100
        },
        {
          name: "Categorías",
          current: usage.categories,
          limit: limits.categories,
          percentage: (usage.categories / limits.categories) * 100
        }
      ]
    };
  },
});