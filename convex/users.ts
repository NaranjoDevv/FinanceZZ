import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query para obtener el usuario actual
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    console.log("🔍 getCurrentUser called");
    
    const identity = await ctx.auth.getUserIdentity();
    console.log("👤 Identity:", identity ? { tokenIdentifier: identity.tokenIdentifier, email: identity.email } : null);
    
    if (!identity) {
      console.log("❌ No identity found");
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();
    
    console.log("👥 User found:", user ? { _id: user._id, email: user.email } : null);
    
    return user;
  },
});

// Mutation para crear o actualizar usuario
export const createOrUpdateUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (existingUser) {
      // Actualizar usuario existente
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    } else {
      // Crear nuevo usuario
      const userId = await ctx.db.insert("users", {
        tokenIdentifier: args.tokenIdentifier,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        plan: "free",
        onboardingCompleted: false,
        currency: "USD",
        timezone: "UTC",
        language: "en",
      });
      return userId;
    }
  },
});

// Mutation para completar onboarding
export const completeOnboarding = mutation({
  args: {
    currency: v.string(),
    timezone: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuario no autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.patch(user._id, {
      currency: args.currency,
      timezone: args.timezone,
      language: args.language,
      onboardingCompleted: true,
    });

    return user._id;
  },
});

// Mutation para actualizar plan de suscripción
export const updateUserPlan = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuario no autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.patch(user._id, {
      plan: args.plan,
      subscribedSince: args.plan !== "free" ? Date.now() : undefined,
    });

    return user._id;
  },
});