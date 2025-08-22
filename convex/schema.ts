import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabla de usuarios
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk ID
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium")),
    planExpiry: v.optional(v.number()),
    subscribedSince: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
    currency: v.string(), // default: 'COP' for free users, customizable for premium
    numberRounding: v.optional(v.boolean()), // default: false - whether to round numbers (1M, 1K)
    timezone: v.string(),
    language: v.string(),
    // Billing limits and usage tracking
    limits: v.object({
      monthlyTransactions: v.number(), // 50 for free, unlimited for premium
      activeDebts: v.number(), // 3 for free, unlimited for premium
      recurringTransactions: v.number(), // 2 for free, unlimited for premium
      categories: v.number(), // 3 for free, unlimited for premium
    }),
    usage: v.object({
      monthlyTransactions: v.number(),
      activeDebts: v.number(),
      recurringTransactions: v.number(),
      categories: v.number(),
      lastResetDate: v.number(), // timestamp for monthly reset
    })
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Tabla de transacciones
  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("debt_payment"),
      v.literal("loan_received")
    ),
    amount: v.number(),
    description: v.string(),
    date: v.number(), // timestamp
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    isRecurring: v.boolean(),
    recurringRefId: v.optional(v.id("transactions")),
    recurringFrequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly")
      )
    ),
    tags: v.optional(v.string()),
    attachments: v.optional(v.string()),
    notes: v.optional(v.string()),
    debtId: v.optional(v.id("debts")),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_type", ["userId", "type"])
    .index("by_category", ["categoryId"])
    .index("by_debt", ["debtId"]),

  // Tabla de deudas
  debts: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("owes_me"), v.literal("i_owe")),
    originalAmount: v.number(),
    currentAmount: v.number(),
    counterpartyName: v.string(),
    counterpartyContact: v.optional(v.string()),
    description: v.string(),
    startDate: v.number(),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("open"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("partially_paid")
    ),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_user_status", ["userId", "status"])
    .index("by_due_date", ["dueDate"]),

  // Tabla de categorías
  categories: defineTable({
    userId: v.optional(v.id("users")), // null = system category
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isExpense: v.boolean(),
    isSystem: v.boolean(),
    order: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "isExpense"])
    .index("by_system", ["isSystem"])
    .index("by_order", ["order"]),

  // Tabla de subcategorías
  subcategories: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_category_order", ["categoryId", "order"]),

  // Tabla de presupuestos (feature futura)
  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    period: v.union(v.literal("monthly"), v.literal("yearly")),
    startDate: v.number(),
    alertThreshold: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_category", ["categoryId"]),

  // Tabla de metas (feature futura)
  goals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    deadline: v.optional(v.number()),
    category: v.union(
      v.literal("savings"),
      v.literal("debt_payoff"),
      v.literal("investment"),
      v.literal("purchase"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("failed")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_category", ["userId", "category"]),

  // Tabla de contactos
  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"])
    .index("by_email", ["email"]),

  // Tabla de recordatorios
  reminders: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    category: v.union(
      v.literal("debt"),
      v.literal("payment"),
      v.literal("meeting"),
      v.literal("task"),
      v.literal("other")
    ),
    relatedDebtId: v.optional(v.id("debts")),
    relatedContactId: v.optional(v.id("contacts")),
    isRecurring: v.boolean(),
    recurringFrequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_due_date", ["dueDate"])
    .index("by_debt", ["relatedDebtId"])
    .index("by_contact", ["relatedContactId"]),

  // Tabla de transacciones recurrentes
  recurringTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("debt_payment"),
      v.literal("loan_received")
    ),
    amount: v.number(),
    description: v.string(),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    recurringFrequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    isActive: v.boolean(),
    nextExecutionDate: v.number(),
    totalExecutions: v.number(),
    tags: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_next_execution", ["nextExecutionDate"])
    .index("by_category", ["categoryId"]),
});