import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabla de usuarios
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk ID
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("premium"), v.literal("admin")),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin"))), // Admin role system
    adminPermissions: v.optional(v.array(v.string())), // Array of permission strings
    planExpiry: v.optional(v.number()),
    subscribedSince: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
    currency: v.string(), // default: 'COP' for free users, customizable for premium
    numberRounding: v.optional(v.boolean()), // default: false - whether to round numbers (1M, 1K)
    timezone: v.string(),
    language: v.string(),
    // Stripe integration fields
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("unpaid")
    )),
    // Billing limits and usage tracking
    limits: v.object({
      monthlyTransactions: v.number(), // 10 for free, unlimited for premium
      activeDebts: v.number(), // 1 for free, unlimited for premium
      recurringTransactions: v.number(), // 2 for free, unlimited for premium
      categories: v.number(), // 2 for free, unlimited for premium
    }),
    usage: v.object({
      monthlyTransactions: v.number(),
      activeDebts: v.number(),
      recurringTransactions: v.number(),
      categories: v.number(),
      lastResetDate: v.number(), // timestamp for monthly reset
    }),
    // Admin metadata
    createdAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()), // For admin control
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_role", ["role"])
    .index("by_plan", ["plan"]),

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

  // ===== ADMIN TABLES =====
  
  // Tabla de planes de suscripción (administrable por admin)
  subscriptionPlans: defineTable({
    name: v.string(), // "Free", "Premium", "Enterprise", etc.
    displayName: v.string(), // "Plan Gratuito", "Plan Premium", etc.
    description: v.string(),
    priceMonthly: v.number(), // Price in cents (0 for free)
    priceYearly: v.optional(v.number()), // Optional yearly price
    currency: v.string(), // "USD", "COP", etc.
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    isActive: v.boolean(),
    limits: v.object({
      monthlyTransactions: v.number(),
      activeDebts: v.number(),
      recurringTransactions: v.number(),
      categories: v.number(),
      // Future features
      budgets: v.optional(v.number()),
      goals: v.optional(v.number()),
      contacts: v.optional(v.number()),
      reports: v.optional(v.number()),
    }),
    features: v.array(v.string()), // Array of feature flags
    order: v.number(), // Display order
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"), // Admin who created it
  })
    .index("by_active", ["isActive"])
    .index("by_order", ["order"])
    .index("by_creator", ["createdBy"]),

  // Tabla de monedas disponibles (administrable por admin)
  currencies: defineTable({
    code: v.string(), // "USD", "COP", "EUR", etc.
    name: v.string(), // "US Dollar", "Colombian Peso", etc.
    symbol: v.string(), // "$", "$", "€", etc.
    position: v.union(v.literal("before"), v.literal("after")), // Symbol position
    decimals: v.number(), // Number of decimal places
    isActive: v.boolean(),
    isDefault: v.boolean(), // Only one can be default
    exchangeRate: v.optional(v.number()), // Exchange rate to USD for conversion
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"), // Admin who created it
  })
    .index("by_code", ["code"])
    .index("by_active", ["isActive"])
    .index("by_default", ["isDefault"])
    .index("by_creator", ["createdBy"]),

  // Tabla de permisos del sistema
  permissions: defineTable({
    name: v.string(), // "manage_users", "edit_plans", "view_analytics", etc.
    displayName: v.string(), // "Gestionar Usuarios", "Editar Planes", etc.
    description: v.string(),
    category: v.string(), // "users", "billing", "content", "system", etc.
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Tabla de roles y sus permisos
  roles: defineTable({
    name: v.string(), // "admin", "super_admin", "moderator", etc.
    displayName: v.string(), // "Administrador", "Super Administrador", etc.
    description: v.string(),
    permissions: v.array(v.string()), // Array of permission names
    isActive: v.boolean(),
    isSystemRole: v.boolean(), // Cannot be deleted
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.id("users")), // Admin who created it
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"])
    .index("by_system", ["isSystemRole"]),

  // Tabla de asignación de permisos a usuarios específicos
  userPermissions: defineTable({
    userId: v.id("users"),
    permission: v.string(), // Permission name
    grantedBy: v.id("users"), // Admin who granted the permission
    grantedAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_permission", ["permission"])
    .index("by_user_permission", ["userId", "permission"])
    .index("by_granted_by", ["grantedBy"])
    .index("by_active", ["isActive"]),

  // Tabla de logs de auditoría para acciones administrativas
  adminAuditLogs: defineTable({
    adminUserId: v.id("users"), // Admin who performed the action
    action: v.string(), // "create_user", "update_plan", "delete_currency", etc.
    targetType: v.string(), // "user", "plan", "currency", "permission", etc.
    targetId: v.optional(v.string()), // ID of the affected entity
    details: v.string(), // JSON string with action details
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
  })
    .index("by_admin", ["adminUserId"])
    .index("by_action", ["action"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_severity", ["severity"]),

  // Tabla de configuración del sistema (administrable por super admin)
  systemSettings: defineTable({
    key: v.string(), // "app_name", "maintenance_mode", "default_currency", etc.
    value: v.string(), // JSON string for complex values
    type: v.union(
      v.literal("string"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("json")
    ),
    description: v.string(),
    category: v.string(), // "general", "billing", "features", etc.
    isPublic: v.boolean(), // Whether non-admin users can read this setting
    updatedAt: v.number(),
    updatedBy: v.id("users"), // Admin who last updated it
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"]),
});