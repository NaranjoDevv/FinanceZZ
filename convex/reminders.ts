import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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

    return await ctx.db.insert("reminders", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      status: "pending",
      category: args.category,
      relatedDebtId: args.relatedDebtId,
      relatedContactId: args.relatedContactId,
      isRecurring: args.isRecurring,
      recurringFrequency: args.recurringFrequency,
      createdAt: now,
      updatedAt: now,
    });
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

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority,
      status: args.status,
      category: args.category,
      relatedDebtId: args.relatedDebtId,
      relatedContactId: args.relatedContactId,
      isRecurring: args.isRecurring,
      recurringFrequency: args.recurringFrequency,
      updatedAt: Date.now(),
    });
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