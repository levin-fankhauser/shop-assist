import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const orderStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("delivered"),
);

const orderValidator = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  customerId: v.id("users"),
  shopperId: v.optional(v.id("users")),
  title: v.string(),
  notes: v.optional(v.string()),
  items: v.array(v.string()),
  status: orderStatusValidator,
});

type RoleProfile = { role: "customer" | "shopper" } | null;

type RoleContext = {
  db: {
    query: (tableName: "profiles") => {
      withIndex: (
        indexName: "by_userId",
        cb: (q: {
          eq: (fieldName: "userId", value: Id<"users">) => unknown;
        }) => unknown,
      ) => {
        unique: () => Promise<RoleProfile>;
      };
    };
  };
};

async function getRole(
  ctx: RoleContext,
  userId: Id<"users">,
): Promise<"customer" | "shopper" | null> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  return profile?.role ?? null;
}

async function requireAuthAndRole(
  ctx: RoleContext,
  expectedRole: "customer" | "shopper",
  userId: Id<"users"> | null,
): Promise<Id<"users">> {
  if (userId === null) {
    throw new Error("Nicht angemeldet.");
  }

  const role = await getRole(ctx, userId);
  if (role !== expectedRole) {
    throw new Error("Keine Berechtigung.");
  }

  return userId;
}

export const createOrder = mutation({
  args: {
    title: v.string(),
    notes: v.optional(v.string()),
    items: v.array(v.string()),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const customerId = await requireAuthAndRole(
      ctx as RoleContext,
      "customer",
      userId,
    );

    const title = args.title.trim();
    const items = args.items
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const notes = args.notes?.trim();

    if (title.length === 0) {
      throw new Error("Bitte einen Titel eingeben.");
    }

    if (items.length === 0) {
      throw new Error("Bitte mindestens einen Artikel erfassen.");
    }

    return await ctx.db.insert("orders", {
      customerId,
      title,
      notes: notes && notes.length > 0 ? notes : undefined,
      items,
      status: "open",
    });
  },
});

export const listCustomerOrders = query({
  args: {},
  returns: v.array(orderValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const customerId = await requireAuthAndRole(
      ctx as RoleContext,
      "customer",
      userId,
    );

    return await ctx.db
      .query("orders")
      .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
      .order("desc")
      .take(100);
  },
});

export const listOpenOrders = query({
  args: {},
  returns: v.array(orderValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    await requireAuthAndRole(ctx as RoleContext, "shopper", userId);

    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("asc")
      .take(100);
  },
});

export const listShopperOrders = query({
  args: {},
  returns: v.array(orderValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const shopperId = await requireAuthAndRole(
      ctx as RoleContext,
      "shopper",
      userId,
    );

    const inProgress = await ctx.db
      .query("orders")
      .withIndex("by_shopperId_and_status", (q) =>
        q.eq("shopperId", shopperId).eq("status", "in_progress"),
      )
      .order("desc")
      .collect();

    const delivered = await ctx.db
      .query("orders")
      .withIndex("by_shopperId_and_status", (q) =>
        q.eq("shopperId", shopperId).eq("status", "delivered"),
      )
      .order("desc")
      .take(50);

    return [...inProgress, ...delivered].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  },
});

export const acceptOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const shopperId = await requireAuthAndRole(
      ctx as RoleContext,
      "shopper",
      userId,
    );

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden.");
    }

    if (order.status !== "open") {
      throw new Error("Bestellung ist nicht mehr offen.");
    }

    await ctx.db.patch(args.orderId, {
      shopperId,
      status: "in_progress",
    });

    return null;
  },
});

export const markDelivered = mutation({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const shopperId = await requireAuthAndRole(
      ctx as RoleContext,
      "shopper",
      userId,
    );

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden.");
    }

    if (order.status !== "in_progress") {
      throw new Error(
        "Nur Bestellungen in Bearbeitung koennen geliefert werden.",
      );
    }

    if (order.shopperId !== shopperId) {
      throw new Error(
        "Diese Bestellung wurde von einer anderen Person uebernommen.",
      );
    }

    await ctx.db.patch(args.orderId, {
      status: "delivered",
    });

    return null;
  },
});
