import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ===== PERMISSION CONSTANTS =====
export const ADMIN_PERMISSIONS = {
  // User Management
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  EDIT_USER_ROLES: "edit_user_roles",
  DEACTIVATE_USERS: "deactivate_users",
  
  // Plan Management
  MANAGE_PLANS: "manage_plans",
  VIEW_PLANS: "view_plans",
  EDIT_PLAN_LIMITS: "edit_plan_limits",
  CREATE_PLANS: "create_plans",
  DELETE_PLANS: "delete_plans",
  
  // Currency Management
  MANAGE_CURRENCIES: "manage_currencies",
  VIEW_CURRENCIES: "view_currencies",
  CREATE_CURRENCIES: "create_currencies",
  EDIT_CURRENCIES: "edit_currencies",
  DELETE_CURRENCIES: "delete_currencies",
  
  // Permission Management
  MANAGE_PERMISSIONS: "manage_permissions",
  ASSIGN_PERMISSIONS: "assign_permissions",
  VIEW_PERMISSIONS: "view_permissions",
  
  // System Settings
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  
  // Analytics & Reports
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_DATA: "export_data",
} as const;

// ===== HELPER FUNCTIONS =====

// Check if user is admin
export const isUserAdmin = async (ctx: any, userId: Id<"users">) => {
  const user = await ctx.db.get(userId);
  return user && (user.role === "admin" || user.role === "super_admin");
};

// Check if user has specific permission
export const userHasPermission = async (ctx: any, userId: Id<"users">, permission: string) => {
  const user = await ctx.db.get(userId);
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === "super_admin") return true;
  
  // Check if user has permission in their adminPermissions array
  if (user.adminPermissions && user.adminPermissions.includes(permission)) {
    return true;
  }
  
  // Check if user has permission through userPermissions table
  const userPermission = await ctx.db
    .query("userPermissions")
    .withIndex("by_user_permission", (q: any) => 
      q.eq("userId", userId).eq("permission", permission)
    )
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .first();
    
  if (userPermission) {
    // Check if permission hasn't expired
    if (!userPermission.expiresAt || userPermission.expiresAt > Date.now()) {
      return true;
    }
  }
  
  return false;
};

// Log admin action
export const logAdminAction = async (
  ctx: any,
  adminUserId: Id<"users">,
  action: string,
  targetType: string,
  targetId?: string,
  details?: any,
  severity: "info" | "warning" | "error" | "critical" = "info"
) => {
  await ctx.db.insert("adminAuditLogs", {
    adminUserId,
    action,
    targetType,
    targetId,
    details: JSON.stringify(details || {}),
    timestamp: Date.now(),
    severity,
  });
};

// ===== ADMIN USER MANAGEMENT =====

// Get current user with admin check
export const getCurrentAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is admin
    if (!await isUserAdmin(ctx, user._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    return user;
  },
});

// Promote user to admin
export const promoteUserToAdmin = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("super_admin")),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    // Only super_admin can promote to super_admin
    if (args.role === "super_admin" && adminUser.role !== "super_admin") {
      throw new Error("Access denied: Super admin privileges required");
    }

    // Check permission
    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.EDIT_USER_ROLES)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Update user role and permissions
    await ctx.db.patch(args.targetUserId, {
      role: args.role,
      plan: "admin", // Admin plan
      adminPermissions: args.permissions || [],
    });

    // Log the action
    await logAdminAction(
      ctx,
      adminUser._id,
      "promote_user_to_admin",
      "user",
      args.targetUserId,
      { newRole: args.role, permissions: args.permissions },
      "info"
    );

    return {
      success: true,
      message: `User promoted to ${args.role} successfully`,
    };
  },
});

// Get all users (admin view)
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.VIEW_USERS)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    const limit = args.limit || 50;
    
    const users = await ctx.db
      .query("users")
      .order("desc")
      .paginate({
        numItems: limit,
        cursor: args.cursor || null,
      });

    return users;
  },
});

// Update user limits (admin only)
export const updateUserLimits = mutation({
  args: {
    userId: v.id("users"),
    limits: v.object({
      monthlyTransactions: v.number(),
      activeDebts: v.number(),
      recurringTransactions: v.number(),
      categories: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.EDIT_PLAN_LIMITS)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const oldLimits = targetUser.limits;
    
    await ctx.db.patch(args.userId, {
      limits: args.limits,
    });

    // Log the action
    await logAdminAction(
      ctx,
      adminUser._id,
      "update_user_limits",
      "user",
      args.userId,
      { oldLimits, newLimits: args.limits },
      "info"
    );

    return {
      success: true,
      message: "User limits updated successfully",
    };
  },
});

// ===== PLAN MANAGEMENT =====

// Get all subscription plans
export const getAllPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.VIEW_PLANS)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    return await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_order", (q) => q.gte("order", 0))
      .collect();
  },
});

// Create new subscription plan
export const createSubscriptionPlan = mutation({
  args: {
    name: v.string(),
    displayName: v.string(),
    description: v.string(),
    priceMonthly: v.number(),
    priceYearly: v.optional(v.number()),
    currency: v.string(),
    limits: v.object({
      monthlyTransactions: v.number(),
      activeDebts: v.number(),
      recurringTransactions: v.number(),
      categories: v.number(),
    }),
    features: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.CREATE_PLANS)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    const planId = await ctx.db.insert("subscriptionPlans", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: adminUser._id,
    });

    // Log the action
    await logAdminAction(
      ctx,
      adminUser._id,
      "create_subscription_plan",
      "plan",
      planId,
      args,
      "info"
    );

    return {
      planId,
      success: true,
      message: "Subscription plan created successfully",
    };
  },
});

// ===== CURRENCY MANAGEMENT =====

// Get all currencies
export const getAllCurrencies = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.VIEW_CURRENCIES)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    return await ctx.db.query("currencies").collect();
  },
});

// Create new currency
export const createCurrency = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    symbol: v.string(),
    position: v.union(v.literal("before"), v.literal("after")),
    decimals: v.number(),
    exchangeRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.CREATE_CURRENCIES)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    // Check if currency code already exists
    const existingCurrency = await ctx.db
      .query("currencies")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingCurrency) {
      throw new Error("Currency with this code already exists");
    }

    const currencyId = await ctx.db.insert("currencies", {
      ...args,
      isActive: true,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: adminUser._id,
    });

    // Log the action
    await logAdminAction(
      ctx,
      adminUser._id,
      "create_currency",
      "currency",
      currencyId,
      args,
      "info"
    );

    return {
      currencyId,
      success: true,
      message: "Currency created successfully",
    };
  },
});

// ===== PERMISSION MANAGEMENT =====

// Assign permission to user
export const assignPermissionToUser = mutation({
  args: {
    userId: v.id("users"),
    permission: v.string(),
    expiresAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!adminUser || !await isUserAdmin(ctx, adminUser._id)) {
      throw new Error("Access denied: Admin privileges required");
    }

    if (!await userHasPermission(ctx, adminUser._id, ADMIN_PERMISSIONS.ASSIGN_PERMISSIONS)) {
      throw new Error("Access denied: Insufficient permissions");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Check if permission already exists and is active
    const existingPermission = await ctx.db
      .query("userPermissions")
      .withIndex("by_user_permission", (q: any) => 
        q.eq("userId", args.userId).eq("permission", args.permission)
      )
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .first();

    if (existingPermission) {
      throw new Error("User already has this permission");
    }

    const permissionId = await ctx.db.insert("userPermissions", {
      userId: args.userId,
      permission: args.permission,
      grantedBy: adminUser._id,
      grantedAt: Date.now(),
      expiresAt: args.expiresAt,
      isActive: true,
      notes: args.notes,
    });

    // Log the action
    await logAdminAction(
      ctx,
      adminUser._id,
      "assign_permission",
      "user_permission",
      permissionId,
      { userId: args.userId, permission: args.permission },
      "info"
    );

    return {
      permissionId,
      success: true,
      message: "Permission assigned successfully",
    };
  },
});

// Initialize default admin data
export const initializeAdminSystem = mutation({
  args: {
    superAdminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this is the first admin setup
    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "super_admin"))
      .collect();

    if (existingAdmins.length > 0) {
      throw new Error("Admin system already initialized");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.superAdminEmail))
      .first();

    if (!user) {
      throw new Error("User not found with provided email");
    }

    // Promote to super admin
    await ctx.db.patch(user._id, {
      role: "super_admin",
      plan: "admin",
      adminPermissions: Object.values(ADMIN_PERMISSIONS),
    });

    // Create default currencies
    const defaultCurrencies = [
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        position: "before" as const,
        decimals: 2,
        isDefault: false,
        exchangeRate: 1,
      },
      {
        code: "COP",
        name: "Colombian Peso",
        symbol: "$",
        position: "before" as const,
        decimals: 0,
        isDefault: true,
        exchangeRate: 4000, // Example rate
      },
    ];

    for (const currency of defaultCurrencies) {
      await ctx.db.insert("currencies", {
        ...currency,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user._id,
      });
    }

    // Create default subscription plans
    const defaultPlans = [
      {
        name: "free",
        displayName: "Plan Gratuito",
        description: "Plan básico con funcionalidades limitadas",
        priceMonthly: 0,
        currency: "COP",
        limits: {
          monthlyTransactions: 10,
          activeDebts: 1,
          recurringTransactions: 2,
          categories: 2,
        },
        features: ["basic_transactions", "basic_categories", "basic_debts"],
        order: 1,
      },
      {
        name: "premium",
        displayName: "Plan Premium",
        description: "Plan completo con todas las funcionalidades",
        priceMonthly: 1990000, // 19,900 COP in cents
        currency: "COP",
        limits: {
          monthlyTransactions: 999999,
          activeDebts: 999999,
          recurringTransactions: 999999,
          categories: 999999,
        },
        features: [
          "unlimited_transactions",
          "unlimited_categories",
          "unlimited_debts",
          "advanced_reports",
          "currency_selection",
          "number_formatting",
          "priority_support",
        ],
        order: 2,
      },
    ];

    for (const plan of defaultPlans) {
      await ctx.db.insert("subscriptionPlans", {
        ...plan,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user._id,
      });
    }

    return {
      success: true,
      message: "Admin system initialized successfully",
      superAdminId: user._id,
    };
  },
});