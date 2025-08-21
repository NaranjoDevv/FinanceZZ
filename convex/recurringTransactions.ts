import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query to get all recurring transactions for a user
export const getRecurringTransactions = query({
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

    const recurringTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get category and subcategory names
    const enrichedTransactions = await Promise.all(
      recurringTransactions.map(async (transaction) => {
        let categoryName = undefined;
        let subcategoryName = undefined;

        if (transaction.categoryId) {
          const category = await ctx.db.get(transaction.categoryId);
          categoryName = category?.name;
        }

        if (transaction.subcategoryId) {
          const subcategory = await ctx.db.get(transaction.subcategoryId);
          subcategoryName = subcategory?.name;
        }

        return {
          ...transaction,
          categoryName,
          subcategoryName,
        };
      })
    );

    return enrichedTransactions;
  },
});

// Query to get active recurring transactions that need to be executed
export const getActiveRecurringTransactions = query({
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

    const now = Date.now();
    
    return await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("isActive"), true),
          q.lte(q.field("nextExecutionDate"), now)
        )
      )
      .collect();
  },
});

// Mutation to create a new recurring transaction
export const createRecurringTransaction = mutation({
  args: {
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
    nextExecutionDate: v.number(),
  },
  handler: async (ctx, args) => {
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

    // Validate amount
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate next execution date
    if (args.nextExecutionDate <= Date.now()) {
      throw new Error("Next execution date must be in the future");
    }

    // Create the recurring transaction
    const transactionData: {
      userId: Id<"users">;
      type: "income" | "expense" | "debt_payment" | "loan_received";
      amount: number;
      description: string;
      recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
      nextExecutionDate: number;
      isActive: boolean;
      totalExecutions: number;
      createdAt: number;
      updatedAt: number;
      categoryId?: Id<"categories">;
      subcategoryId?: Id<"subcategories">;
    } = {
      userId: user._id,
      type: args.type,
      amount: args.amount,
      description: args.description,
      recurringFrequency: args.recurringFrequency,
      nextExecutionDate: args.nextExecutionDate,
      isActive: true,
      totalExecutions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (args.categoryId) {
      transactionData.categoryId = args.categoryId;
    }
    if (args.subcategoryId) {
      transactionData.subcategoryId = args.subcategoryId;
    }

    const recurringTransactionId = await ctx.db.insert("recurringTransactions", transactionData);

    return recurringTransactionId;
  },
});

// Mutation to update a recurring transaction
export const updateRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
    type: v.optional(v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("debt_payment"),
      v.literal("loan_received")
    )),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    recurringFrequency: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    )),
    nextExecutionDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    // Get the existing transaction
    const existingTransaction = await ctx.db.get(args.id);
    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Verify ownership
    if (existingTransaction.userId !== user._id) {
      throw new Error("Not authorized to update this transaction");
    }

    // Validate amount if provided
    if (args.amount !== undefined && args.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate next execution date if provided
    if (args.nextExecutionDate !== undefined && args.nextExecutionDate <= Date.now()) {
      throw new Error("Next execution date must be in the future");
    }

    // Update the transaction
    const updateData: Partial<Doc<"recurringTransactions">> = {};
    
    if (args.type !== undefined) updateData.type = args.type;
    if (args.amount !== undefined) updateData.amount = args.amount;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
    if (args.subcategoryId !== undefined) updateData.subcategoryId = args.subcategoryId;
    if (args.recurringFrequency !== undefined) updateData.recurringFrequency = args.recurringFrequency;
    if (args.nextExecutionDate !== undefined) updateData.nextExecutionDate = args.nextExecutionDate;
    
    updateData.updatedAt = Date.now();

    await ctx.db.patch(args.id, updateData);
    
    return args.id;
  },
});

// Mutation to toggle active status of a recurring transaction
export const toggleRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
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

    // Get the existing transaction
    const existingTransaction = await ctx.db.get(args.id);
    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Verify ownership
    if (existingTransaction.userId !== user._id) {
      throw new Error("Not authorized to update this transaction");
    }

    await ctx.db.patch(args.id, { 
      isActive: args.isActive,
      updatedAt: Date.now()
    });
    
    return args.id;
  },
});

// Mutation to delete a recurring transaction
export const deleteRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
  },
  handler: async (ctx, args) => {
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

    // Get the existing transaction
    const existingTransaction = await ctx.db.get(args.id);
    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    // Verify ownership
    if (existingTransaction.userId !== user._id) {
      throw new Error("Not authorized to delete this transaction");
    }

    await ctx.db.delete(args.id);
    
    return args.id;
  },
});

// Mutation to execute a recurring transaction (create actual transaction)
export const executeRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
  },
  handler: async (ctx, args) => {
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

    // Get the recurring transaction
    const recurringTransaction = await ctx.db.get(args.id);
    if (!recurringTransaction) {
      throw new Error("Recurring transaction not found");
    }

    // Verify ownership
    if (recurringTransaction.userId !== user._id) {
      throw new Error("Not authorized to execute this transaction");
    }

    // Verify it's active
    if (!recurringTransaction.isActive) {
      throw new Error("Transaction is not an active recurring transaction");
    }

    // Create the actual transaction
    const transactionData: {
      userId: Id<"users">;
      type: "income" | "expense" | "debt_payment" | "loan_received";
      amount: number;
      description: string;
      date: number;
      isRecurring: boolean;
      recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
      categoryId?: Id<"categories">;
      subcategoryId?: Id<"subcategories">;
    } = {
      userId: user._id,
      type: recurringTransaction.type,
      amount: recurringTransaction.amount,
      description: recurringTransaction.description,
      date: Date.now(),
      isRecurring: true,
      recurringFrequency: recurringTransaction.recurringFrequency,
    };

    if (recurringTransaction.categoryId) {
      transactionData.categoryId = recurringTransaction.categoryId;
    }
    if (recurringTransaction.subcategoryId) {
      transactionData.subcategoryId = recurringTransaction.subcategoryId;
    }

    const actualTransactionId = await ctx.db.insert("transactions", transactionData);

    // Calculate next execution date
    const currentDate = new Date(recurringTransaction.nextExecutionDate);
    let nextExecutionDate: number;

    switch (recurringTransaction.recurringFrequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        nextExecutionDate = currentDate.getTime();
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        nextExecutionDate = currentDate.getTime();
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        nextExecutionDate = currentDate.getTime();
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        nextExecutionDate = currentDate.getTime();
        break;
      default:
        throw new Error("Invalid recurring frequency");
    }

    // Update the recurring transaction
    await ctx.db.patch(args.id, {
      nextExecutionDate,
      totalExecutions: (recurringTransaction.totalExecutions || 0) + 1,
      updatedAt: Date.now(),
    });

    return {
      actualTransactionId,
      nextExecutionDate,
    };
  },
});

// Query to get recurring transaction statistics
export const getRecurringTransactionStats = query({
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

    const recurringTransactions = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const activeCount = recurringTransactions.filter(t => t.isActive).length;
    const pausedCount = recurringTransactions.filter(t => !t.isActive).length;
    
    // Calculate monthly impact
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    recurringTransactions
      .filter(t => t.isActive)
      .forEach(transaction => {
        let monthlyAmount = transaction.amount;
        
        // Convert to monthly amount
        switch (transaction.recurringFrequency) {
          case "daily":
            monthlyAmount *= 30;
            break;
          case "weekly":
            monthlyAmount *= 4.33;
            break;
          case "monthly":
            monthlyAmount *= 1;
            break;
          case "yearly":
            monthlyAmount /= 12;
            break;
        }
        
        if (transaction.type === "income") {
          monthlyIncome += monthlyAmount;
        } else {
          monthlyExpenses += monthlyAmount;
        }
      });

    return {
      total: recurringTransactions.length,
      active: activeCount,
      paused: pausedCount,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
    };
  },
});