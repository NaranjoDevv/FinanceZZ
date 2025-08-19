import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Obtener todos los contactos del usuario
export const getContacts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Obtener un contacto específico
export const getContact = query({
  args: { 
    userId: v.id("users"),
    contactId: v.id("contacts")
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact || contact.userId !== args.userId) {
      throw new Error("Contacto no encontrado");
    }

    return contact;
  },
});

// Obtener deudas relacionadas con un contacto
export const getContactDebts = query({
  args: { 
    userId: v.id("users"),
    contactName: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("debts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("counterpartyName"), args.contactName))
      .collect();
  },
});

// Crear un nuevo contacto
export const createContact = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("contacts", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      notes: args.notes,
      avatar: args.avatar,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Actualizar un contacto
export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const contact = await ctx.db.get(args.id);
    if (!contact || contact.userId !== user._id) {
      throw new Error("Contacto no encontrado");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      notes: args.notes,
      avatar: args.avatar,
      updatedAt: Date.now(),
    });
  },
});

// Eliminar un contacto
export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("Usuario no autenticado");

    const contact = await ctx.db.get(args.id);
    if (!contact || contact.userId !== user._id) {
      throw new Error("Contacto no encontrado");
    }

    await ctx.db.delete(args.id);
  },
});

// Buscar contactos
export const searchContacts = query({
  args: { 
    userId: v.id("users"),
    searchTerm: v.string() 
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        contact.phone?.includes(args.searchTerm)
    );
  },
});