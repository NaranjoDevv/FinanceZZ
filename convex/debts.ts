import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get all debts for a user
export const getUserDebts = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("owes_me"), v.literal("i_owe"))),
    status: v.optional(v.union(v.literal("open"), v.literal("paid"), v.literal("overdue"), v.literal("partially_paid"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const debts = await query.order("desc").collect();
    return debts;
  },
});

// Query to get debt statistics
export const getDebtStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = debts.reduce(
      (acc, debt) => {
        if (debt.status === "open" || debt.status === "partially_paid") {
          if (debt.type === "owes_me") {
            acc.totalOwedToMe += debt.currentAmount;
            acc.countOwedToMe++;
          } else {
            acc.totalIOwe += debt.currentAmount;
            acc.countIOwe++;
          }
        }
        return acc;
      },
      {
        totalOwedToMe: 0,
        totalIOwe: 0,
        countOwedToMe: 0,
        countIOwe: 0,
        netBalance: 0,
      }
    );

    stats.netBalance = stats.totalOwedToMe - stats.totalIOwe;

    return stats;
  },
});

// Query to get a specific debt
export const getDebt = query({
  args: {
    id: v.id("debts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.id);
    if (!debt || debt.userId !== args.userId) {
      return null;
    }
    return debt;
  },
});

// Mutation to create a new debt
export const createDebt = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("owes_me"), v.literal("i_owe")),
    amount: v.number(),
    description: v.string(),
    counterpartyName: v.string(),
    counterpartyContact: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    interestRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate amount is positive
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate counterparty name is not empty
    if (!args.counterpartyName.trim()) {
      throw new Error("Counterparty name is required");
    }

    const debtId = await ctx.db.insert("debts", {
      userId: args.userId,
      type: args.type,
      originalAmount: args.amount,
      currentAmount: args.amount,
      description: args.description.trim(),
      counterpartyName: args.counterpartyName.trim(),
      counterpartyContact: args.counterpartyContact?.trim(),
      startDate: Date.now(),
      dueDate: args.dueDate,
      notes: args.notes?.trim(),
      interestRate: args.interestRate,
      status: "open",
    });

    return debtId;
  },
});

// Mutation to update a debt
export const updateDebt = mutation({
  args: {
    id: v.id("debts"),
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("owes_me"), v.literal("i_owe"))),
    originalAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    description: v.optional(v.string()),
    counterpartyName: v.optional(v.string()),
    counterpartyContact: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    interestRate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("open"), v.literal("paid"), v.literal("overdue"), v.literal("partially_paid"))),
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.id);
    if (!debt) {
      throw new Error("Debt not found");
    }

    // Verify ownership
    if (debt.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Validate amounts if provided
    if (args.originalAmount !== undefined && args.originalAmount <= 0) {
      throw new Error("Original amount must be positive");
    }
    if (args.currentAmount !== undefined && args.currentAmount < 0) {
      throw new Error("Current amount cannot be negative");
    }

    // Validate counterparty name if provided
    if (args.counterpartyName !== undefined && !args.counterpartyName.trim()) {
      throw new Error("Counterparty name is required");
    }

    const updateData: any = {};

    // Only update fields that are provided
    if (args.type !== undefined) updateData.type = args.type;
    if (args.originalAmount !== undefined) updateData.originalAmount = args.originalAmount;
    if (args.currentAmount !== undefined) updateData.currentAmount = args.currentAmount;
    if (args.description !== undefined) updateData.description = args.description.trim();
    if (args.counterpartyName !== undefined) updateData.counterpartyName = args.counterpartyName.trim();
    if (args.counterpartyContact !== undefined) updateData.counterpartyContact = args.counterpartyContact?.trim();
    if (args.dueDate !== undefined) updateData.dueDate = args.dueDate;
    if (args.notes !== undefined) updateData.notes = args.notes?.trim();
    if (args.interestRate !== undefined) updateData.interestRate = args.interestRate;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to mark a debt as paid
export const markDebtAsPaid = mutation({
  args: {
    id: v.id("debts"),
    userId: v.id("users"),
    paidDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.id);
    if (!debt) {
      throw new Error("Debt not found");
    }

    // Verify ownership
    if (debt.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if debt is already paid
    if (debt.status === "paid") {
      throw new Error("Debt is already paid");
    }

    const updateData: any = {
      status: "paid",
      currentAmount: 0,
    };

    if (args.notes) {
      updateData.notes = args.notes.trim();
    }

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to make a partial payment
export const makePartialPayment = mutation({
  args: {
    id: v.id("debts"),
    userId: v.id("users"),
    paymentAmount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.id);
    if (!debt) {
      throw new Error("Debt not found");
    }

    // Verify ownership
    if (debt.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if debt is already paid
    if (debt.status === "paid") {
      throw new Error("Debt is already paid");
    }

    // Validate payment amount
    if (args.paymentAmount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    if (args.paymentAmount > debt.currentAmount) {
      throw new Error("Payment amount cannot exceed current debt amount");
    }

    const newCurrentAmount = debt.currentAmount - args.paymentAmount;
    const newStatus = newCurrentAmount === 0 ? "paid" : "partially_paid";

    const updateData: any = {
      currentAmount: newCurrentAmount,
      status: newStatus,
    };

    if (args.notes) {
      updateData.notes = args.notes.trim();
    }

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to delete a debt
export const deleteDebt = mutation({
  args: {
    id: v.id("debts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const debt = await ctx.db.get(args.id);
    if (!debt) {
      throw new Error("Debt not found");
    }

    // Verify ownership
    if (debt.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get debts by person
export const getDebtsByPerson = query({
  args: {
    userId: v.id("users"),
    counterpartyName: v.string(),
  },
  handler: async (ctx, args) => {
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("counterpartyName"), args.counterpartyName))
      .order("desc")
      .collect();

    return debts;
  },
});

// Query to get overdue debts
export const getOverdueDebts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("status"), "open"),
            q.eq(q.field("status"), "partially_paid")
          ),
          q.neq(q.field("dueDate"), undefined),
          q.lt(q.field("dueDate"), currentTime)
        )
      )
      .order("asc")
      .collect();

    return debts;
  },
});

// Query to get upcoming due debts (next 7 days)
export const getUpcomingDueDebts = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentTime = Date.now();
    const daysAhead = args.days || 7;
    const futureTime = currentTime + (daysAhead * 24 * 60 * 60 * 1000);
    
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("status"), "open"),
            q.eq(q.field("status"), "partially_paid")
          ),
          q.neq(q.field("dueDate"), undefined),
          q.gte(q.field("dueDate"), currentTime),
          q.lte(q.field("dueDate"), futureTime)
        )
      )
      .order("asc")
      .collect();

    return debts;
  },
});

// Query to get debt summary by person
export const getDebtSummaryByPerson = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const debts = await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "open"),
        q.eq(q.field("status"), "partially_paid"),
        q.eq(q.field("status"), "overdue")
      ))
      .collect();

    const summary = debts.reduce((acc, debt) => {
      const counterpartyName = debt.counterpartyName;
      
      if (!acc[counterpartyName]) {
        acc[counterpartyName] = {
          counterpartyName,
          totalOwedToMe: 0,
          totalIOwe: 0,
          netBalance: 0,
          debtCount: 0,
        };
      }

      if (debt.type === "owes_me") {
        acc[counterpartyName].totalOwedToMe += debt.currentAmount;
      } else {
        acc[counterpartyName].totalIOwe += debt.currentAmount;
      }
      
      acc[counterpartyName].netBalance = acc[counterpartyName].totalOwedToMe - acc[counterpartyName].totalIOwe;
      acc[counterpartyName].debtCount++;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(summary);
  },
});