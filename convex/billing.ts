import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

    await ctx.db.patch(args.userId, {
      plan: "premium",
      planExpiry: now + oneMonth,
      subscribedSince: user.subscribedSince || now,
      limits: {
        monthlyTransactions: 999999, // Unlimited
        activeDebts: 999999, // Unlimited
        recurringTransactions: 999999, // Unlimited
        categories: 999999, // Unlimited
      },
    });

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

    await ctx.db.patch(args.userId, {
      plan: "free",
      planExpiry: undefined,
      limits: {
        monthlyTransactions: 50,
        activeDebts: 3,
        recurringTransactions: 2,
        categories: 3,
      },
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
        plan: user.plan
      };
    }

    // Check monthly reset for transactions
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const shouldReset = now - user.usage.lastResetDate > oneMonth;

    if (shouldReset) {
      await ctx.db.patch(args.userId, {
        usage: {
          ...user.usage,
          monthlyTransactions: 0,
          lastResetDate: now,
        }
      });
      
      // Refetch updated user
      const updatedUser = await ctx.db.get(args.userId);
      if (!updatedUser) throw new Error("User not found after update");
      
      user.usage = updatedUser.usage;
    }

    let canPerform = true;
    let currentUsage = 0;
    let limit = 0;

    switch (args.action) {
      case "create_transaction":
        currentUsage = user.usage.monthlyTransactions;
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
      plan: user.plan
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