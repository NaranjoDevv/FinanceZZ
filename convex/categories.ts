import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get all categories for a user
export const getUserCategories = query({
  args: {
    userId: v.id("users"),
    isExpense: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.isExpense !== undefined) {
      query = query.filter((q) => q.eq(q.field("isExpense"), args.isExpense));
    }

    const categories = await query.order("asc").collect();

    // Get subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await ctx.db
          .query("subcategories")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .order("asc")
          .collect();

        return {
          ...category,
          subcategories,
        };
      })
    );

    return categoriesWithSubcategories;
  },
});

// Query to get all categories for a user (simplified version)
export const getCategories = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();

    return categories;
  },
});

// Query to get a specific category with its subcategories
export const getCategory = query({
  args: {
    id: v.id("categories"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category || (category.userId !== args.userId && !category.isSystem)) {
      return null;
    }

    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .order("asc")
      .collect();

    return {
      ...category,
      subcategories,
    };
  },
});

// Mutation to create a new category
export const createCategory = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isExpense: v.boolean(),
    isSystem: v.optional(v.boolean()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if category name already exists for this user
    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    const categoryId = await ctx.db.insert("categories", {
      userId: args.userId,
      name: args.name.trim(),
      color: args.color || "#6B7280",
      icon: args.icon || "📁",
      isExpense: args.isExpense,
      isSystem: args.isSystem || false,
      order: args.order,
    });

    return categoryId;
  },
});

// Mutation to update a category
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isExpense: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    if (category.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if new name already exists for this user (if name is being changed)
    if (args.name && args.name !== category.name) {
      const existingCategory = await ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();

      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }
    }

    const updateData: any = {};

    // Only update fields that are provided
    if (args.name !== undefined) updateData.name = args.name.trim();
    if (args.color !== undefined) updateData.color = args.color;
    if (args.icon !== undefined) updateData.icon = args.icon;
    if (args.isExpense !== undefined) updateData.isExpense = args.isExpense;
    if (args.order !== undefined) updateData.order = args.order;

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to delete a category
export const deleteCategory = mutation({
  args: {
    id: v.id("categories"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Verify ownership
    if (category.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if category is being used in transactions
    const transactionsUsingCategory = await ctx.db
      .query("transactions")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();

    if (transactionsUsingCategory) {
      throw new Error("Cannot delete category that is being used in transactions");
    }

    // Delete all subcategories first
    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const subcategory of subcategories) {
      await ctx.db.delete(subcategory._id);
    }

    // Delete the category
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get all subcategories for a category
export const getSubcategories = query({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      // Verify category ownership - allow system categories
      const category = await ctx.db.get(args.categoryId);
      
      if (!category) {
        throw new Error("Category not found or unauthorized");
      }
      
      // Allow access if: user owns the category OR it's a system category (isSystem=true OR userId=null)
      const isOwner = category.userId === args.userId;
      const isSystemCategory = category.isSystem === true || category.userId === null;
      
      if (!isOwner && !isSystemCategory) {
        throw new Error("Category not found or unauthorized");
      }
      
      const subcategories = await ctx.db
        .query("subcategories")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .order("asc")
        .collect();
      
      return subcategories;
    } else {
      // Get all subcategories for the user
      const userCategories = await ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      
      const categoryIds = userCategories.map(cat => cat._id);
      
      const allSubcategories = await Promise.all(
        categoryIds.map(async (categoryId) => {
          return await ctx.db
            .query("subcategories")
            .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
            .collect();
        })
      );
      
      return allSubcategories.flat().sort((a, b) => a.order - b.order);
    }
  },
});

// Mutation to create a new subcategory
export const createSubcategory = mutation({
  args: {
    categoryId: v.id("categories"),
    userId: v.id("users"),
    name: v.string(),
    icon: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify category ownership
    const category = await ctx.db.get(args.categoryId);
    if (!category || (category.userId !== args.userId && !category.isSystem)) {
      throw new Error("Category not found or unauthorized");
    }

    // Check if subcategory name already exists for this category
    const existingSubcategory = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingSubcategory) {
      throw new Error("Subcategory with this name already exists in this category");
    }

    const subcategoryId = await ctx.db.insert("subcategories", {
      categoryId: args.categoryId,
      name: args.name.trim(),
      icon: args.icon || "📄",
      order: args.order,
    });

    return subcategoryId;
  },
});

// Mutation to update a subcategory
export const updateSubcategory = mutation({
  args: {
    id: v.id("subcategories"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subcategory = await ctx.db.get(args.id);
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    // Verify category ownership
    const category = await ctx.db.get(subcategory.categoryId);
    if (!category || category.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if new name already exists for this category (if name is being changed)
    if (args.name && args.name !== subcategory.name) {
      const existingSubcategory = await ctx.db
        .query("subcategories")
        .withIndex("by_category", (q) => q.eq("categoryId", subcategory.categoryId))
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();

      if (existingSubcategory) {
        throw new Error("Subcategory with this name already exists in this category");
      }
    }

    const updateData: any = {};

    // Only update fields that are provided
    if (args.name !== undefined) updateData.name = args.name.trim();
    if (args.icon !== undefined) updateData.icon = args.icon;
    if (args.order !== undefined) updateData.order = args.order;

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

// Mutation to delete a subcategory
export const deleteSubcategory = mutation({
  args: {
    id: v.id("subcategories"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subcategory = await ctx.db.get(args.id);
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    // Verify category ownership
    const category = await ctx.db.get(subcategory.categoryId);
    if (!category || category.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Check if subcategory is being used in transactions
    const transactionsUsingSubcategory = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("subcategoryId"), args.id))
      .first();

    if (transactionsUsingSubcategory) {
      throw new Error("Cannot delete subcategory that is being used in transactions");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get default categories for a new user
export const getDefaultCategories = query({
  args: {},
  handler: async (ctx, args) => {
    return [
      {
        name: "Alimentación",
        description: "Gastos en comida y bebidas",
        color: "#EF4444",
        icon: "🍽️",
        type: "expense" as const,
        subcategories: [
          { name: "Supermercado", icon: "🛒" },
          { name: "Restaurantes", icon: "🍕" },
          { name: "Café", icon: "☕" },
        ],
      },
      {
        name: "Transporte",
        description: "Gastos de movilidad",
        color: "#3B82F6",
        icon: "🚗",
        type: "expense" as const,
        subcategories: [
          { name: "Combustible", icon: "⛽" },
          { name: "Transporte público", icon: "🚌" },
          { name: "Taxi/Uber", icon: "🚕" },
        ],
      },
      {
        name: "Entretenimiento",
        description: "Gastos de ocio y diversión",
        color: "#8B5CF6",
        icon: "🎬",
        type: "expense" as const,
        subcategories: [
          { name: "Cine", icon: "🎥" },
          { name: "Streaming", icon: "📺" },
          { name: "Juegos", icon: "🎮" },
        ],
      },
      {
        name: "Salario",
        description: "Ingresos por trabajo",
        color: "#10B981",
        icon: "💰",
        type: "income" as const,
        subcategories: [
          { name: "Sueldo base", icon: "💵" },
          { name: "Bonos", icon: "🎁" },
          { name: "Horas extra", icon: "⏰" },
        ],
      },
      {
        name: "Inversiones",
        description: "Ingresos por inversiones",
        color: "#F59E0B",
        icon: "📈",
        type: "income" as const,
        subcategories: [
          { name: "Dividendos", icon: "💎" },
          { name: "Intereses", icon: "🏦" },
          { name: "Criptomonedas", icon: "₿" },
        ],
      },
    ];
  },
});