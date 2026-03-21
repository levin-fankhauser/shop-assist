import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_ROLE = "benutzer" as const;

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return {
      role: existing?.role ?? DEFAULT_ROLE,
      fullName: existing?.fullName ?? "",
      profileId: existing?._id ?? null,
      userId,
    };
  },
});

export const upsertProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    role: v.union(v.literal("benutzer"), v.literal("shopper")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const payload = {
      userId,
      fullName: args.fullName?.trim() || undefined,
      role: args.role,
    } as const;

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("profiles", payload);
  },
});
