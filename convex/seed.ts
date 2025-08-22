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
        monthlyTransactions: 50,
        activeDebts: 3,
        recurringTransactions: 2,
        categories: 3,
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

// Función para crear datos de ejemplo
export const seedData = mutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
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

    // Crear transacciones de ejemplo
    const transactions = [
      {
        userId: args.userId,
        type: "income" as const,
        amount: 3500,
        description: "Salario mensual",
        date: Date.now() - 86400000 * 5, // 5 días atrás
        categoryId: incomeCategory,
        isRecurring: false,
        notes: "Salario del mes de enero"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 1200,
        description: "Pago de renta",
        date: Date.now() - 86400000 * 4, // 4 días atrás
        categoryId: housingCategory,
        isRecurring: false,
        notes: "Renta del apartamento"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 85.50,
        description: "Supermercado",
        date: Date.now() - 86400000 * 3, // 3 días atrás
        categoryId: foodCategory,
        isRecurring: false,
        notes: "Compras semanales"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 45,
        description: "Gasolina",
        date: Date.now() - 86400000 * 2, // 2 días atrás
        categoryId: transportCategory,
        isRecurring: false,
        notes: "Tanque lleno"
      },
      {
        userId: args.userId,
        type: "income" as const,
        amount: 500,
        description: "Proyecto freelance",
        date: Date.now() - 86400000 * 1, // 1 día atrás
        categoryId: incomeCategory,
        isRecurring: false,
        notes: "Desarrollo de sitio web"
      },
      {
        userId: args.userId,
        type: "expense" as const,
        amount: 25,
        description: "Café y desayuno",
        date: Date.now(), // Hoy
        categoryId: foodCategory,
        isRecurring: false,
        notes: "Desayuno en cafetería"
      }
    ];

    // Insertar todas las transacciones
    const insertedTransactions = [];
    for (const transaction of transactions) {
      const id = await ctx.db.insert("transactions", transaction);
      insertedTransactions.push(id);
    }

    return {
      message: "Datos de ejemplo creados exitosamente",
      categories: {
        income: incomeCategory,
        food: foodCategory,
        housing: housingCategory,
        transport: transportCategory
      },
      transactions: insertedTransactions
    };
  }
});

// Función para limpiar datos de ejemplo
export const clearSeedData = mutation({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Eliminar transacciones del usuario
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Eliminar categorías del usuario
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    return {
      message: "Datos de ejemplo eliminados exitosamente",
      deletedTransactions: transactions.length,
      deletedCategories: categories.length
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

// Función para obtener el estado actual de límites y uso del usuario
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