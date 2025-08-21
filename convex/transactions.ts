import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get all transactions for a user
export const getUserTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    // Apply filters
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }
    if (args.subcategoryId) {
      query = query.filter((q) => q.eq(q.field("subcategoryId"), args.subcategoryId));
    }
    if (args.startDate !== undefined) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }
    if (args.endDate !== undefined) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    const transactions = await query
      .order("desc")
      .take(args.limit || 50);

    // Enrich with category and subcategory data
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const category = transaction.categoryId
          ? await ctx.db.get(transaction.categoryId)
          : null;
        const subcategory = transaction.subcategoryId
          ? await ctx.db.get(transaction.subcategoryId)
          : null;

        return {
          ...transaction,
          category,
          subcategory,
        };
      })
    );

    return enrichedTransactions;
  },
});













// Query to get transaction statistics
export const getTransactionStats = query({
  args: {
    userId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.startDate !== undefined) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }
    if (args.endDate !== undefined) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    const transactions = await query.collect();

    const stats = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
          acc.incomeCount++;
        } else {
          acc.totalExpenses += transaction.amount;
          acc.expenseCount++;
        }
        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        incomeCount: 0,
        expenseCount: 0,
        balance: 0,
      }
    );

    stats.balance = stats.totalIncome - stats.totalExpenses;

    return stats;
  },
});

// Mutation to create a new transaction
export const createTransaction = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("debt_payment"), v.literal("loan_received")),
    amount: v.number(),
    description: v.string(),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    date: v.number(),
    notes: v.optional(v.string()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate amount is positive
    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate category exists if provided
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Validate subcategory exists and belongs to category if provided
    if (args.subcategoryId) {
      const subcategory = await ctx.db.get(args.subcategoryId);
      if (!subcategory) {
        throw new Error("Subcategory not found");
      }
      if (args.categoryId && subcategory.categoryId !== args.categoryId) {
        throw new Error("Subcategory does not belong to the specified category");
      }
    }

    const transactionData: {
      userId: Id<"users">;
      type: "income" | "expense" | "debt_payment" | "loan_received";
      amount: number;
      description: string;
      date: number;
      isRecurring: boolean;
      categoryId?: Id<"categories">;
      subcategoryId?: Id<"subcategories">;
      notes?: string;
      tags?: string;
    } = {
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      description: args.description,
      date: args.date,
      isRecurring: false,
    };

    if (args.categoryId) transactionData.categoryId = args.categoryId;
    if (args.subcategoryId) transactionData.subcategoryId = args.subcategoryId;
    if (args.notes) transactionData.notes = args.notes;
    if (args.tags) transactionData.tags = args.tags;

    const transactionId = await ctx.db.insert("transactions", transactionData);

    return transactionId;
  },
});

// Mutation to update a transaction
export const updateTransaction = mutation({
  args: {
    id: v.id("transactions"),
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"), v.literal("debt_payment"), v.literal("loan_received"))),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Verify ownership
    if (transaction.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Validate amount if provided
    if (args.amount !== undefined && args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate category exists if provided
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
    }

    // Validate subcategory exists and belongs to category if provided
    if (args.subcategoryId) {
      const subcategory = await ctx.db.get(args.subcategoryId);
      if (!subcategory) {
        throw new Error("Subcategory not found");
      }
      const categoryId = args.categoryId || transaction.categoryId;
      if (categoryId && subcategory.categoryId !== categoryId) {
        throw new Error("Subcategory does not belong to the specified category");
      }
    }

    const updateData: any = {};

    // Only update fields that are provided
    if (args.type !== undefined) updateData.type = args.type;
    if (args.amount !== undefined) updateData.amount = args.amount;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
    if (args.subcategoryId !== undefined) updateData.subcategoryId = args.subcategoryId;
    if (args.date !== undefined) updateData.date = args.date;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.tags !== undefined) updateData.tags = args.tags;

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to delete a transaction
export const deleteTransaction = mutation({
  args: {
    id: v.id("transactions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Verify ownership
    if (transaction.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get recent transactions
export const getRecentTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    // Enrich with category data
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const category = transaction.categoryId
          ? await ctx.db.get(transaction.categoryId)
          : null;
        const subcategory = transaction.subcategoryId
          ? await ctx.db.get(transaction.subcategoryId)
          : null;

        return {
          ...transaction,
          category,
          subcategory,
        };
      })
    );

    return enrichedTransactions;
  },
});