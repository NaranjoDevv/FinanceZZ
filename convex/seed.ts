import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Función para crear un usuario gratuito con limitaciones
export const createFreeUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const userData = {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      plan: "free" as const,
      onboardingCompleted: false,
      currency: "COP", // Peso colombiano por defecto para usuarios gratuitos
      numberRounding: false,
      timezone: "America/Bogota",
      language: "es",
      limits: {
        monthlyTransactions: 10,
        activeDebts: 1,
        recurringTransactions: 2,
        categories: 2,
      },
      usage: {
        lastResetDate: now,
        monthlyTransactions: 0,
        activeDebts: 0,
        recurringTransactions: 0,
        categories: 0,
      },
    };

    if (args.imageUrl) {
      (userData as any).imageUrl = args.imageUrl;
    }

    const userId = await ctx.db.insert("users", userData);

    return {
      userId,
      message: "Usuario gratuito creado exitosamente con limitaciones del plan free",
      limits: {
        monthlyTransactions: 50,
        activeDebts: 3,
        recurringTransactions: 2,
        categories: 3,
      }
    };
  }
});

// Función para crear un usuario premium sin limitaciones
export const createPremiumUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000); // 1 año
    
    const userData = {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      plan: "premium" as const,
      planExpiry: oneYearFromNow,
      subscribedSince: now,
      onboardingCompleted: false,
      currency: args.currency || "USD",
      numberRounding: false,
      timezone: "America/Bogota",
      language: "es",
      limits: {
        monthlyTransactions: 999999, // Ilimitado
        activeDebts: 999999, // Ilimitado
        recurringTransactions: 999999, // Ilimitado
        categories: 999999, // Ilimitado
      },
      usage: {
        lastResetDate: now,
        monthlyTransactions: 0,
        activeDebts: 0,
        recurringTransactions: 0,
        categories: 0,
      },
    };

    if (args.imageUrl) {
      (userData as any).imageUrl = args.imageUrl;
    }

    const userId = await ctx.db.insert("users", userData);

    return {
      userId,
      message: "Usuario premium creado exitosamente sin limitaciones",
      planExpiry: oneYearFromNow
    };
  }
});

// Función para crear datos de ejemplo que cuentan hacia los límites
export const seedData = mutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar si el usuario ya tiene datos de seed para evitar duplicados
    const existingTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    if (existingTransactions.length > 0) {
      return {
        message: "El usuario ya tiene transacciones existentes. Usa clearSeedData primero.",
        existingCount: existingTransactions.length
      };
    }

    // Crear categorías de ejemplo
    const incomeCategory = await ctx.db.insert("categories", {
      userId: args.userId,
      name: "Trabajo",
      icon: "💼",
      color: "#10B981",
      isExpense: false,
      isSystem: false,
      order: 1
    });

    const foodCategory = await ctx.db.insert("categories", {
      userId: args.userId,
      name: "Alimentación",
      icon: "🍽️",
      color: "#F59E0B",
      isExpense: true,
      isSystem: false,
      order: 2
    });

    const housingCategory = await ctx.db.insert("categories", {
      userId: args.userId,
      name: "Vivienda",
      icon: "🏠",
      color: "#EF4444",
      isExpense: true,
      isSystem: false,
      order: 3
    });

    const transportCategory = await ctx.db.insert("categories", {
      userId: args.userId,
      name: "Transporte",
      icon: "🚗",
      color: "#8B5CF6",
      isExpense: true,
      isSystem: false,
      order: 4
    });

    // Incrementar el contador de categorías (4 categorías creadas)
    if (user.usage) {
      const updatedUsage = {
        ...user.usage,
        categories: (user.usage.categories || 0) + 4
      };
      await ctx.db.patch(args.userId, { usage: updatedUsage });
    }

    // Crear más transacciones para probar límites rápidamente
    // Para usuarios gratuitos (límite: 10), crear 8 transacciones para dejar solo 2 disponibles
    const transactions = [
      {
        userId: args.userId,
        type: "income" as const,
        amount: 3500000, // $3,500,000 COP
        description: "Salario mensual",
        date: Date.now() - 86400000 * 10, // 10 días atrás
        categoryId: incomeCategory,
        isRecurring: false,
        notes: "Salario del mes actual"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 1200000, // $1,200,000 COP
        description: "Pago de renta",
        date: Date.now() - 86400000 * 9, // 9 días atrás
        categoryId: housingCategory,
        isRecurring: false,
        notes: "Renta del apartamento"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 385500, // $385,500 COP
        description: "Supermercado semanal",
        date: Date.now() - 86400000 * 8, // 8 días atrás
        categoryId: foodCategory,
        isRecurring: false,
        notes: "Compras semanales completas"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 145000, // $145,000 COP
        description: "Gasolina",
        date: Date.now() - 86400000 * 7, // 7 días atrás
        categoryId: transportCategory,
        isRecurring: false,
        notes: "Tanque lleno"
      },
      {
        userId: args.userId,
        type: "income" as const,
        amount: 500000, // $500,000 COP
        description: "Proyecto freelance",
        date: Date.now() - 86400000 * 6, // 6 días atrás
        categoryId: incomeCategory,
        isRecurring: false,
        notes: "Desarrollo de sitio web"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 75000, // $75,000 COP
        description: "Cena en restaurante",
        date: Date.now() - 86400000 * 5, // 5 días atrás
        categoryId: foodCategory,
        isRecurring: false,
        notes: "Cena de aniversario"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 120000, // $120,000 COP
        description: "Servicios públicos",
        date: Date.now() - 86400000 * 4, // 4 días atrás
        categoryId: housingCategory,
        isRecurring: false,
        notes: "Electricidad y agua"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 45000, // $45,000 COP
        description: "Transporte público",
        date: Date.now() - 86400000 * 3, // 3 días atrás
        categoryId: transportCategory,
        isRecurring: false,
        notes: "Tarjeta de transporte semanal"
      }
    ];

    // Para usuarios premium, crear todas las transacciones
    // Para usuarios gratuitos, crear solo las que están dentro del límite
    const maxTransactions = user.plan === "free" ? 8 : transactions.length;
    const transactionsToCreate = transactions.slice(0, maxTransactions);

    // Insertar transacciones
    const insertedTransactions = [];
    for (const transaction of transactionsToCreate) {
      const id = await ctx.db.insert("transactions", transaction);
      insertedTransactions.push(id);
    }

    // Incrementar el contador de transacciones mensuales
    if (user.usage) {
      const updatedUsage = {
        ...user.usage,
        monthlyTransactions: (user.usage.monthlyTransactions || 0) + insertedTransactions.length
      };
      await ctx.db.patch(args.userId, { usage: updatedUsage });
    }

    const currentUsage = {
      monthlyTransactions: (user.usage?.monthlyTransactions || 0) + insertedTransactions.length,
      categories: (user.usage?.categories || 0) + 4,
      activeDebts: user.usage?.activeDebts || 0,
      recurringTransactions: user.usage?.recurringTransactions || 0
    };

    return {
      message: `Datos de ejemplo creados exitosamente para usuario ${user.plan}`,
      plan: user.plan,
      categories: {
        income: incomeCategory,
        food: foodCategory,
        housing: housingCategory,
        transport: transportCategory
      },
      transactions: insertedTransactions,
      currentUsage,
      limits: user.limits,
      remainingTransactions: user.plan === "free" ? Math.max(0, (user.limits?.monthlyTransactions || 10) - currentUsage.monthlyTransactions) : "unlimited",
      warningMessage: user.plan === "free" && currentUsage.monthlyTransactions >= 8 ? 
        `⚠️ ATENCIÓN: Has usado ${currentUsage.monthlyTransactions} de ${user.limits?.monthlyTransactions || 10} transacciones. Solo quedan ${Math.max(0, (user.limits?.monthlyTransactions || 10) - currentUsage.monthlyTransactions)} disponibles.` : null
    };
  }
});

// Función para limpiar datos de ejemplo y resetear contadores
export const clearSeedData = mutation({
  args: {
    userId: v.id("users"),
    resetCounters: v.optional(v.boolean()) // Default: true
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Eliminar transacciones del usuario
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Eliminar categorías del usuario (solo las no-sistema)
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const deletedCategories = [];
    for (const category of categories) {
      if (!category.isSystem) { // Solo eliminar categorías no-sistema
        await ctx.db.delete(category._id);
        deletedCategories.push(category._id);
      }
    }

    // Resetear contadores de uso si se solicita (default: true)
    const shouldResetCounters = args.resetCounters !== false;
    if (shouldResetCounters && user.usage) {
      const resetUsage = {
        ...user.usage,
        monthlyTransactions: 0,
        categories: Math.max(0, (user.usage.categories || 0) - deletedCategories.length),
        activeDebts: 0, // Solo resetear si no hay deudas activas
        recurringTransactions: 0, // Solo resetear si no hay transacciones recurrentes
        lastResetDate: Date.now()
      };
      
      await ctx.db.patch(args.userId, { usage: resetUsage });
    }

    return {
      message: shouldResetCounters ? 
        "Datos de ejemplo eliminados y contadores reseteados exitosamente" :
        "Datos de ejemplo eliminados exitosamente",
      deletedTransactions: transactions.length,
      deletedCategories: deletedCategories.length,
      resetCounters: shouldResetCounters,
      newUsage: shouldResetCounters ? {
        monthlyTransactions: 0,
        categories: Math.max(0, (user.usage?.categories || 0) - deletedCategories.length),
        activeDebts: user.usage?.activeDebts || 0,
        recurringTransactions: user.usage?.recurringTransactions || 0
      } : user.usage
    };
  }
});

// Función para verificar y actualizar límites de usuario
export const checkUserLimits = mutation({
  args: {
    userId: v.id("users"),
    action: v.union(
      v.literal("create_transaction"),
      v.literal("create_debt"),
      v.literal("create_recurring_transaction"),
      v.literal("create_category")
    )
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Si es usuario premium, permitir todo
    if (user.plan === "premium") {
      return { allowed: true, message: "Usuario premium - sin limitaciones" };
    }

    // Verificar si necesitamos resetear contadores mensuales
    if (user.usage) {
      const now = Date.now();
      const lastReset = new Date(user.usage.lastResetDate);
      const currentDate = new Date(now);
      
      // Si es un nuevo mes, resetear contador de transacciones
      if (lastReset.getMonth() !== currentDate.getMonth() || 
          lastReset.getFullYear() !== currentDate.getFullYear()) {
        await ctx.db.patch(args.userId, {
          usage: {
            ...user.usage,
            monthlyTransactions: 0,
            lastResetDate: now
          }
        });
        user.usage.monthlyTransactions = 0;
      }
    }

    // Verificar límites según la acción
    if (user.usage && user.limits) {
      switch (args.action) {
        case "create_transaction":
          if (user.usage.monthlyTransactions >= user.limits.monthlyTransactions) {
            return {
              allowed: false,
              message: `Has alcanzado el límite de ${user.limits.monthlyTransactions} transacciones por mes. Actualiza a Premium para transacciones ilimitadas.`,
              currentUsage: user.usage.monthlyTransactions,
              limit: user.limits.monthlyTransactions
            };
          }
          break;
          
        case "create_debt":
          if (user.usage.activeDebts >= user.limits.activeDebts) {
            return {
              allowed: false,
              message: `Has alcanzado el límite de ${user.limits.activeDebts} deudas activas. Actualiza a Premium para deudas ilimitadas.`,
              currentUsage: user.usage.activeDebts,
              limit: user.limits.activeDebts
            };
          }
          break;
          
        case "create_recurring_transaction":
          if (user.usage.recurringTransactions >= user.limits.recurringTransactions) {
            return {
              allowed: false,
              message: `Has alcanzado el límite de ${user.limits.recurringTransactions} transacciones recurrentes. Actualiza a Premium para transacciones recurrentes ilimitadas.`,
              currentUsage: user.usage.recurringTransactions,
              limit: user.limits.recurringTransactions
            };
          }
          break;
          
        case "create_category":
          if (user.usage.categories >= user.limits.categories) {
            return {
              allowed: false,
              message: `Has alcanzado el límite de ${user.limits.categories} categorías personalizadas. Actualiza a Premium para categorías ilimitadas.`,
              currentUsage: user.usage.categories,
              limit: user.limits.categories
            };
          }
          break;
      }
    }

    return { allowed: true, message: "Acción permitida" };
  }
});

// Función para incrementar contadores de uso
export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("transaction"),
      v.literal("debt"),
      v.literal("recurring_transaction"),
      v.literal("category")
    ),
    increment: v.optional(v.number()) // default: 1
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!user.usage) {
      throw new Error("Usuario no tiene datos de uso inicializados");
    }

    const incrementValue = args.increment || 1;
    const updatedUsage = { ...user.usage };

    switch (args.type) {
      case "transaction":
        updatedUsage.monthlyTransactions += incrementValue;
        break;
      case "debt":
        updatedUsage.activeDebts += incrementValue;
        break;
      case "recurring_transaction":
        updatedUsage.recurringTransactions += incrementValue;
        break;
      case "category":
        updatedUsage.categories += incrementValue;
        break;
    }

    await ctx.db.patch(args.userId, { usage: updatedUsage });
    
    return {
      message: `Contador de ${args.type} actualizado`,
      newUsage: updatedUsage
    };
  }
});

// Función para decrementar contadores de uso (cuando se elimina algo)
export const decrementUsage = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("debt"),
      v.literal("recurring_transaction"),
      v.literal("category")
    ),
    decrement: v.optional(v.number()) // default: 1
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!user.usage) {
      throw new Error("Usuario no tiene datos de uso inicializados");
    }

    const decrementValue = args.decrement || 1;
    const updatedUsage = { ...user.usage };

    switch (args.type) {
      case "debt":
        updatedUsage.activeDebts = Math.max(0, updatedUsage.activeDebts - decrementValue);
        break;
      case "recurring_transaction":
        updatedUsage.recurringTransactions = Math.max(0, updatedUsage.recurringTransactions - decrementValue);
        break;
      case "category":
        updatedUsage.categories = Math.max(0, updatedUsage.categories - decrementValue);
        break;
    }

    await ctx.db.patch(args.userId, { usage: updatedUsage });
    
    return {
      message: `Contador de ${args.type} decrementado`,
      newUsage: updatedUsage
    };
  }
});

// Función para crear un usuario de prueba con límites casi alcanzados
export const createTestUserNearLimits = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Crear usuario gratuito con contadores ya altos
    const userData = {
      tokenIdentifier: args.tokenIdentifier,
      email: args.email,
      name: args.name,
      plan: "free" as const,
      onboardingCompleted: false,
      currency: "COP",
      numberRounding: false,
      timezone: "America/Bogota",
      language: "es",
      limits: {
        monthlyTransactions: 10,
        activeDebts: 1,
        recurringTransactions: 2,
        categories: 2,
      },
      usage: {
        lastResetDate: now,
        monthlyTransactions: 9, // 9 de 10 - solo 1 restante
        activeDebts: 0, // 0 de 1 - 1 restante
        recurringTransactions: 1, // 1 de 2 - 1 restante
        categories: 1, // 1 de 2 - 1 restante
      },
    };

    if (args.imageUrl) {
      (userData as any).imageUrl = args.imageUrl;
    }

    const userId = await ctx.db.insert("users", userData);

    return {
      userId,
      message: "Usuario de prueba creado exitosamente - cerca de los límites",
      limits: userData.limits,
      usage: userData.usage,
      remainingCapacity: {
        transactions: "1 restante (próxima transacción alcanzará el límite)",
        debts: "1 restante",
        recurringTransactions: "1 restante",
        categories: "1 restante"
      },
      testingTips: {
        transactions: "Crea 1 transacción más para alcanzar el límite",
        debts: "Crea 1 deuda para alcanzar el límite",
        recurringTransactions: "Crea 1 transacción recurrente más para alcanzar el límite",
        categories: "Crea 1 categoría más para alcanzar el límite"
      }
    };
  }
});
export const getUserLimitsAndUsage = mutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      limits: user.limits,
      usage: user.usage,
      percentages: {
        transactions: user.plan === "premium" || !user.usage || !user.limits ? 0 : (user.usage.monthlyTransactions / user.limits.monthlyTransactions) * 100,
        debts: user.plan === "premium" || !user.usage || !user.limits ? 0 : (user.usage.activeDebts / user.limits.activeDebts) * 100,
        recurringTransactions: user.plan === "premium" || !user.usage || !user.limits ? 0 : (user.usage.recurringTransactions / user.limits.recurringTransactions) * 100,
        categories: user.plan === "premium" || !user.usage || !user.limits ? 0 : (user.usage.categories / user.limits.categories) * 100,
      }
    };
  }
});