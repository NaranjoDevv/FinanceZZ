import { mutation } from "./_generated/server";
import { v } from "convex/values";

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