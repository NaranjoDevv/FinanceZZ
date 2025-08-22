import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Types for better type safety
type SubscriptionStatus = "active" | "canceled" | "past_due" | "unpaid";

// Constants for plan limits
const FREE_PLAN_LIMITS = {
  monthlyTransactions: 10,
  activeDebts: 1,
  recurringTransactions: 2,
  categories: 2,
};

const PREMIUM_PLAN_LIMITS = {
  monthlyTransactions: 999999,
  activeDebts: 999999,
  recurringTransactions: 999999,
  categories: 999999,
};

// Upgrade user to premium plan
export const upgradeToPremium = mutation({
  args: { 
    userId: v.id("users"),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    const updateData: any = {
      plan: "premium",
      planExpiry: now + oneMonth,
      subscribedSince: user.subscribedSince || now,
      limits: PREMIUM_PLAN_LIMITS,
    };

    // Add Stripe information if provided
    if (args.customerId) {
      updateData.stripeCustomerId = args.customerId;
    }
    if (args.subscriptionId) {
      updateData.stripeSubscriptionId = args.subscriptionId;
    }

    await ctx.db.patch(args.userId, updateData);

    return { success: true };
  },
});

// Downgrade user to free plan
export const downgradeToFree = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      plan: "free",
      limits: FREE_PLAN_LIMITS,
    };
    
    // Remove planExpiry when downgrading to free
    if (user.planExpiry !== undefined) {
      updateData.planExpiry = undefined;
    }

    await ctx.db.patch(args.userId, updateData);

    return { success: true };
  },
});

// Reset monthly usage counters
export const resetMonthlyUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    
    await ctx.db.patch(args.userId, {
      usage: {
        ...user.usage,
        monthlyTransactions: 0,
        lastResetDate: now,
      }
    });
    
    return { success: true };
  },
});

// Check if user can perform action based on limits
export const checkUserLimits = query({
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
      throw new Error("User not found");
    }

    // Premium users have unlimited access
    if (user.plan === "premium") {
      return { 
        canPerform: true, 
        usage: user.usage,
        limits: user.limits,
        plan: user.plan,
        needsReset: false
      };
    }

    // Check if monthly reset is needed for transactions
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const needsReset = now - user.usage.lastResetDate > oneMonth;

    let canPerform = true;
    let currentUsage = 0;
    let limit = 0;

    switch (args.action) {
      case "create_transaction":
        currentUsage = needsReset ? 0 : user.usage.monthlyTransactions;
        limit = user.limits.monthlyTransactions;
        canPerform = currentUsage < limit;
        break;
      
      case "create_debt":
        currentUsage = user.usage.activeDebts;
        limit = user.limits.activeDebts;
        canPerform = currentUsage < limit;
        break;
      
      case "create_recurring_transaction":
        currentUsage = user.usage.recurringTransactions;
        limit = user.limits.recurringTransactions;
        canPerform = currentUsage < limit;
        break;
      
      case "create_category":
        currentUsage = user.usage.categories;
        limit = user.limits.categories;
        canPerform = currentUsage < limit;
        break;
    }

    return { 
      canPerform, 
      currentUsage, 
      limit,
      usage: user.usage,
      limits: user.limits,
      plan: user.plan,
      needsReset
    };
  },
});

// Increment usage counter
export const incrementUsage = mutation({
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
      throw new Error("User not found");
    }

    const newUsage = { ...user.usage };

    switch (args.action) {
      case "create_transaction":
        newUsage.monthlyTransactions += 1;
        break;
      
      case "create_debt":
        newUsage.activeDebts += 1;
        break;
      
      case "create_recurring_transaction":
        newUsage.recurringTransactions += 1;
        break;
      
      case "create_category":
        newUsage.categories += 1;
        break;
    }

    await ctx.db.patch(args.userId, { usage: newUsage });
    
    return { success: true, newUsage };
  },
});

// Decrement usage counter (for deletions)
export const decrementUsage = mutation({
  args: { 
    userId: v.id("users"),
    action: v.union(
      v.literal("delete_debt"),
      v.literal("delete_recurring_transaction"),
      v.literal("delete_category")
    )
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const newUsage = { ...user.usage };

    switch (args.action) {
      case "delete_debt":
        newUsage.activeDebts = Math.max(0, newUsage.activeDebts - 1);
        break;
      
      case "delete_recurring_transaction":
        newUsage.recurringTransactions = Math.max(0, newUsage.recurringTransactions - 1);
        break;
      
      case "delete_category":
        newUsage.categories = Math.max(0, newUsage.categories - 1);
        break;
    }

    await ctx.db.patch(args.userId, { usage: newUsage });
    
    return { success: true, newUsage };
  },
});

// Get user plan and usage info
export const getUserPlanInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    return {
      plan: user.plan,
      planExpiry: user.planExpiry,
      subscribedSince: user.subscribedSince,
      usage: user.usage,
      limits: user.limits,
    };
  },
});

// Update user Stripe customer ID
export const updateStripeCustomerId = mutation({
  args: {
    userId: v.id("users"),
    customerId: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.customerId
    });

    return { success: true };
  },
});

// Update user subscription details
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("unpaid")
    ),
    currentPeriodEnd: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      stripeSubscriptionId: args.subscriptionId,
      subscriptionStatus: args.status
    };

    if (args.currentPeriodEnd) {
      updateData.planExpiry = args.currentPeriodEnd;
    }

    // Update plan based on subscription status
    if (args.status === "active") {
      updateData.plan = "premium";
      updateData.limits = PREMIUM_PLAN_LIMITS;
    } else if (args.status === "canceled" || args.status === "unpaid") {
      updateData.plan = "free";
      updateData.limits = FREE_PLAN_LIMITS;
    }

    await ctx.db.patch(args.userId, updateData);

    return { success: true };
  },
});

// Get user by Stripe customer ID (for webhook processing)
export const getUserByStripeCustomerId = query({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.customerId))
      .collect();
    
    return users[0] || null;
  },
});

// Cancel user subscription
export const cancelSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: any = {
      plan: "free",
      subscriptionStatus: "canceled",
      limits: FREE_PLAN_LIMITS,
    };
    
    // Remove planExpiry when canceling subscription
    if (user.planExpiry !== undefined) {
      updateData.planExpiry = undefined;
    }

    await ctx.db.patch(args.userId, updateData);

    return { success: true };
  },
});