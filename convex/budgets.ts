import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get all budgets for a user
export const getUserBudgets = query({
  args: {
    userId: v.id("users"),
    isActive: v.optional(v.boolean()),
    period: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("budgets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    // Apply filters
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }
    if (args.period !== undefined) {
      query = query.filter((q) => q.eq(q.field("period"), args.period));
    }

    const budgets = await query.collect();

    // Enrich with category data and calculate spending
    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const category = budget.categoryId
          ? await ctx.db.get(budget.categoryId)
          : null;

        // Calculate current spending for this budget period
        const currentSpending = await calculateBudgetSpending(ctx, budget);

        return {
          ...budget,
          category,
          currentSpending,
          progress: budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0,
          isOverBudget: currentSpending > budget.amount,
          remainingAmount: budget.amount - currentSpending,
        };
      })
    );

    return enrichedBudgets.sort((a, b) => b.startDate - a.startDate);
  },
});

// Query to get budget details with spending breakdown
export const getBudgetDetails = query({
  args: {
    budgetId: v.id("budgets"),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    const category = budget.categoryId
      ? await ctx.db.get(budget.categoryId)
      : null;

    // Get detailed spending for this budget
    const currentSpending = await calculateBudgetSpending(ctx, budget);
    const spendingBreakdown = await getBudgetSpendingBreakdown(ctx, budget);

    return {
      ...budget,
      category,
      currentSpending,
      progress: budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0,
      isOverBudget: currentSpending > budget.amount,
      remainingAmount: budget.amount - currentSpending,
      spendingBreakdown,
    };
  },
});

// Query to get budget summary for dashboard
export const getBudgetSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const activeBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .collect();

    let totalBudgetAmount = 0;
    let totalSpending = 0;
    let overBudgetCount = 0;
    let nearLimitCount = 0;

    const budgetDetails = await Promise.all(
      activeBudgets.map(async (budget) => {
        const currentSpending = await calculateBudgetSpending(ctx, budget);
        const progress = budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0;
        const isOverBudget = currentSpending > budget.amount;
        const isNearLimit = progress >= (budget.alertThreshold || 80) && !isOverBudget;

        totalBudgetAmount += budget.amount;
        totalSpending += currentSpending;
        
        if (isOverBudget) overBudgetCount++;
        if (isNearLimit) nearLimitCount++;

        return {
          ...budget,
          currentSpending,
          progress,
          isOverBudget,
          isNearLimit,
        };
      })
    );

    return {
      totalBudgets: activeBudgets.length,
      totalBudgetAmount,
      totalSpending,
      overBudgetCount,
      nearLimitCount,
      overallProgress: totalBudgetAmount > 0 ? (totalSpending / totalBudgetAmount) * 100 : 0,
      budgets: budgetDetails,
    };
  },
});

// Mutation to create a new budget
export const createBudget = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    period: v.union(v.literal("monthly"), v.literal("yearly")),
    alertThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user information to check billing limits
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check budget limits for free users
    if (user.plan === "free") {
      const userBudgets = await ctx.db
        .query("budgets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      
      const freeBudgetLimit = 3; // Free users can create up to 3 budgets
      
      if (userBudgets.length >= freeBudgetLimit) {
        throw new Error(`Has alcanzado el límite de ${freeBudgetLimit} presupuestos. Actualiza a Premium para presupuestos ilimitados.`);
      }
    }

    // Validate amount is positive
    if (args.amount <= 0) {
      throw new Error("Budget amount must be positive");
    }

    // Validate alert threshold if provided
    if (args.alertThreshold !== undefined && (args.alertThreshold < 0 || args.alertThreshold > 100)) {
      throw new Error("Alert threshold must be between 0 and 100");
    }

    // Validate category exists if provided
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      
      // Check if user already has a budget for this category and period
      const existingBudget = await ctx.db
        .query("budgets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
        .filter((q) => q.eq(q.field("period"), args.period))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      
      if (existingBudget) {
        throw new Error("Ya existe un presupuesto activo para esta categoría en este período");
      }
    }

    // Calculate start date based on period
    const now = new Date();
    let startDate: number;
    
    if (args.period === "monthly") {
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    } else {
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1).getTime();
    }

    const budgetId = await ctx.db.insert("budgets", {
      userId: args.userId,
      categoryId: args.categoryId,
      amount: args.amount,
      period: args.period,
      startDate,
      alertThreshold: args.alertThreshold || 80,
      isActive: true,
    });

    return budgetId;
  },
});

// Mutation to update an existing budget
export const updateBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
    amount: v.optional(v.number()),
    alertThreshold: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    // Validate amount is positive if provided
    if (args.amount !== undefined && args.amount <= 0) {
      throw new Error("Budget amount must be positive");
    }

    // Validate alert threshold if provided
    if (args.alertThreshold !== undefined && (args.alertThreshold < 0 || args.alertThreshold > 100)) {
      throw new Error("Alert threshold must be between 0 and 100");
    }

    const updates: any = {};
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.alertThreshold !== undefined) updates.alertThreshold = args.alertThreshold;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.budgetId, updates);
    return args.budgetId;
  },
});

// Mutation to delete a budget
export const deleteBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    await ctx.db.delete(args.budgetId);
    return { success: true };
  },
});

// Helper function to calculate current spending for a budget
async function calculateBudgetSpending(ctx: any, budget: any): Promise<number> {
  const now = new Date();
  let startDate: number;
  let endDate: number;

  if (budget.period === "monthly") {
    // Current month period
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  } else {
    // Current year period
    startDate = new Date(now.getFullYear(), 0, 1).getTime();
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime();
  }

  let transactionQuery = ctx.db
    .query("transactions")
    .withIndex("by_user", (q: any) => q.eq("userId", budget.userId))
    .filter((q: any) => q.eq(q.field("type"), "expense"))
    .filter((q: any) => q.gte(q.field("date"), startDate))
    .filter((q: any) => q.lte(q.field("date"), endDate));

  // Filter by category if budget is category-specific
  if (budget.categoryId) {
    transactionQuery = transactionQuery.filter((q: any) => q.eq(q.field("categoryId"), budget.categoryId));
  }

  const transactions = await transactionQuery.collect();
  
  return transactions.reduce((total: number, transaction: any) => total + transaction.amount, 0);
}

// Helper function to get spending breakdown for a budget
async function getBudgetSpendingBreakdown(ctx: any, budget: any) {
  const now = new Date();
  let startDate: number;
  let endDate: number;

  if (budget.period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  } else {
    startDate = new Date(now.getFullYear(), 0, 1).getTime();
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59).getTime();
  }

  let transactionQuery = ctx.db
    .query("transactions")
    .withIndex("by_user", (q: any) => q.eq("userId", budget.userId))
    .filter((q: any) => q.eq(q.field("type"), "expense"))
    .filter((q: any) => q.gte(q.field("date"), startDate))
    .filter((q: any) => q.lte(q.field("date"), endDate));

  if (budget.categoryId) {
    transactionQuery = transactionQuery.filter((q: any) => q.eq(q.field("categoryId"), budget.categoryId));
  }

  const transactions = await transactionQuery.collect();

  // Group by subcategory or description
  const breakdown = transactions.reduce((acc: any, transaction: any) => {
    const key = transaction.subcategoryId || transaction.description || "Other";
    if (!acc[key]) {
      acc[key] = {
        amount: 0,
        count: 0,
        transactions: [],
      };
    }
    acc[key].amount += transaction.amount;
    acc[key].count += 1;
    acc[key].transactions.push(transaction);
    return acc;
  }, {});

  return Object.entries(breakdown).map(([key, value]: [string, any]) => ({
    category: key,
    amount: value.amount,
    count: value.count,
    percentage: budget.amount > 0 ? (value.amount / budget.amount) * 100 : 0,
  }));
}