import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Obtener todos los recordatorios del usuario
export const getReminders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Obtener recordatorios por estado
export const getRemindersByStatus = query({
  args: { 
    userId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")) 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reminders")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId).eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Obtener recordatorios próximos a vencer
export const getUpcomingReminders = query({
  args: { 
    userId: v.id("users"),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const daysAhead = args.days || 7;
    const now = Date.now();
    const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000);

    return await ctx.db
      .query("reminders")
      .withIndex("by_user_status", (q) => q.eq("userId", args.userId).eq("status", "pending"))
      .filter((q) => q.and(
        q.gte(q.field("dueDate"), now),
        q.lte(q.field("dueDate"), futureDate)
      ))
      .order("asc")
      .collect();
  },
});

// Obtener un recordatorio específico
export const getReminder = query({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const reminder = await ctx.db.get(args.id);
    if (!reminder || reminder.userId !== user._id) {
      throw new Error("Recordatorio no encontrado");
    }

    return reminder;
  },
});

// Crear un nuevo recordatorio
export const createReminder = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    category: v.union(v.literal("debt"), v.literal("payment"), v.literal("meeting"), v.literal("task"), v.literal("other")),
    relatedDebtId: v.optional(v.id("debts")),
    relatedContactId: v.optional(v.id("contacts")),
    isRecurring: v.boolean(),
    recurringFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))),
  },
  handler: async (ctx, args) => {

    const now = Date.now();

    const reminderData: {
      userId: Id<"users">;
      title: string;
      dueDate: number;
      priority: "low" | "medium" | "high" | "urgent";
      status: "pending";
      category: "debt" | "payment" | "meeting" | "task" | "other";
      isRecurring: boolean;
      createdAt: number;
      updatedAt: number;
      description?: string;
      relatedDebtId?: Id<"debts">;
      relatedContactId?: Id<"contacts">;
      recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
    } = {
      userId: args.userId,
      title: args.title,
      dueDate: args.dueDate,
      priority: args.priority,
      status: "pending",
      category: args.category,
      isRecurring: args.isRecurring,
      createdAt: now,
      updatedAt: now,
    };

    if (args.description) reminderData.description = args.description;
    if (args.relatedDebtId) reminderData.relatedDebtId = args.relatedDebtId;
    if (args.relatedContactId) reminderData.relatedContactId = args.relatedContactId;
    if (args.recurringFrequency) reminderData.recurringFrequency = args.recurringFrequency;

    return await ctx.db.insert("reminders", reminderData);
  },
});

// Actualizar un recordatorio
export const updateReminder = mutation({
  args: {
    id: v.id("reminders"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
    category: v.union(v.literal("debt"), v.literal("payment"), v.literal("meeting"), v.literal("task"), v.literal("other")),
    relatedDebtId: v.optional(v.id("debts")),
    relatedContactId: v.optional(v.id("contacts")),
    isRecurring: v.boolean(),
    recurringFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const reminder = await ctx.db.get(args.id);
    if (!reminder || reminder.userId !== user._id) {
      throw new Error("Recordatorio no encontrado");
    }

    const updateData: {
      title: string;
      dueDate: number;
      priority: "low" | "medium" | "high" | "urgent";
      status: "pending" | "completed" | "cancelled";
      category: "debt" | "payment" | "meeting" | "task" | "other";
      isRecurring: boolean;
      updatedAt: number;
      description?: string;
      relatedDebtId?: Id<"debts">;
      relatedContactId?: Id<"contacts">;
      recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
    } = {
      title: args.title,
      dueDate: args.dueDate,
      priority: args.priority,
      status: args.status,
      category: args.category,
      isRecurring: args.isRecurring,
      updatedAt: Date.now(),
    };

    if (args.description) updateData.description = args.description;
    if (args.relatedDebtId) updateData.relatedDebtId = args.relatedDebtId;
    if (args.relatedContactId) updateData.relatedContactId = args.relatedContactId;
    if (args.recurringFrequency) updateData.recurringFrequency = args.recurringFrequency;

    await ctx.db.patch(args.id, updateData);
  },
});

// Marcar recordatorio como completado
export const completeReminder = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const reminder = await ctx.db.get(args.id);
    if (!reminder || reminder.userId !== user._id) {
      throw new Error("Recordatorio no encontrado");
    }

    await ctx.db.patch(args.id, {
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});

// Eliminar un recordatorio
export const deleteReminder = mutation({
  args: { id: v.id("reminders") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const reminder = await ctx.db.get(args.id);
    if (!reminder || reminder.userId !== user._id) {
      throw new Error("Recordatorio no encontrado");
    }

    await ctx.db.delete(args.id);
  },
});

// Buscar recordatorios
export const searchReminders = query({
  args: { 
    userId: v.id("users"),
    searchTerm: v.string() 
  },
  handler: async (ctx, args) => {
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return reminders.filter(
      (reminder) =>
        reminder.title.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        reminder.description?.toLowerCase().includes(args.searchTerm.toLowerCase())
    );
  },
});