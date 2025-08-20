import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

    const contactData: {
      userId: Id<"users">;
      name: string;
      createdAt: number;
      updatedAt: number;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      avatar?: string;
    } = {
      userId: args.userId,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    };

    if (args.email) contactData.email = args.email;
    if (args.phone) contactData.phone = args.phone;
    if (args.address) contactData.address = args.address;
    if (args.notes) contactData.notes = args.notes;
    if (args.avatar) contactData.avatar = args.avatar;

    return await ctx.db.insert("contacts", contactData);
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

    const updateData: {
      name: string;
      updatedAt: number;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      avatar?: string;
    } = {
      name: args.name,
      updatedAt: Date.now(),
    };

    if (args.email) updateData.email = args.email;
    if (args.phone) updateData.phone = args.phone;
    if (args.address) updateData.address = args.address;
    if (args.notes) updateData.notes = args.notes;
    if (args.avatar) updateData.avatar = args.avatar;

    await ctx.db.patch(args.id, updateData);
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