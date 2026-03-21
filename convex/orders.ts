import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

type OrderStatus = "offen" | "in_bearbeitung" | "geliefert";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  offen: ["in_bearbeitung"],
  in_bearbeitung: ["geliefert"],
  geliefert: [],
};

const productValidator = v.object({
  name: v.string(),
  quantity: v.number(),
  note: v.optional(v.string()),
  completed: v.optional(v.boolean()),
});

export const createOrder = mutation({
  args: {
    title: v.string(),
    products: v.array(productValidator),
    deliveryAddress: v.string(),
    desiredDeliveryTime: v.string(),
    additionalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    if (args.products.length === 0) {
      throw new Error("Mindestens ein Produkt hinzufügen");
    }

    for (const product of args.products) {
      if (product.name.trim() === "") {
        throw new Error("Produktname darf nicht leer sein");
      }
      if (product.quantity <= 0) {
        throw new Error("Menge muss größer als 0 sein");
      }
    }

    const title = args.title.trim();
    const deliveryAddress = args.deliveryAddress.trim();
    if (!title || !deliveryAddress) {
      throw new Error("Titel und Lieferadresse dürfen nicht leer sein");
    }

    const desiredDeliveryTime = args.desiredDeliveryTime.trim();
    if (!desiredDeliveryTime) {
      throw new Error("Gewünschte Lieferzeit angeben");
    }

    const products = args.products.map((product) => ({
      name: product.name,
      quantity: product.quantity,
      note: product.note,
      completed: false,
    }));

    const orderId = await ctx.db.insert("orders", {
      title,
      products,
      deliveryAddress,
      desiredDeliveryTime,
      additionalNotes: args.additionalNotes?.trim() || undefined,
      status: "offen",
      createdBy: userId,
    });

    return orderId;
  },
});

export const listOrders = query({
  args: {
    scope: v.optional(v.literal("all")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const role = profile?.role ?? "benutzer";
    const scope = args.scope === "all" ? "all" : "own";

    if (scope === "all" && role !== "shopper") {
      throw new Error("Keine Berechtigung für alle Bestellungen");
    }

    const scopedQuery =
      scope === "own"
        ? ctx.db
            .query("orders")
            .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
        : ctx.db.query("orders");

    const results = await scopedQuery
      .order("desc")
      .take(scope === "all" ? 200 : 50);

    // In der Hauptliste nur aktive Bestellungen zeigen.
    return results.filter((o) => o.status !== "geliefert");
  },
});

export const listCompletedOrders = query({
  args: {
    scope: v.optional(v.literal("all")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const role = profile?.role ?? "benutzer";
    const scope = args.scope === "all" ? "all" : "own";

    if (scope === "all" && role !== "shopper") {
      throw new Error("Keine Berechtigung für alle Bestellungen");
    }

    const scopedQuery =
      scope === "own"
        ? ctx.db
            .query("orders")
            .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
        : ctx.db.query("orders");

    const results = await scopedQuery.order("desc").take(200);
    return results.filter((o) => o.status === "geliefert");
  },
});

export const listAcceptedByMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "shopper") {
      return [];
    }

    return await ctx.db
      .query("orders")
      .withIndex("by_acceptedBy", (q) => q.eq("acceptedBy", userId))
      .order("desc")
      .take(200)
      .then((orders) => orders.filter((o) => o.status !== "geliefert"));
  },
});

export const listAvailableForShopper = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "shopper") {
      return [];
    }

    const all = await ctx.db.query("orders").order("desc").take(200);
    return all.filter((order) => order.status === "offen" && !order.acceptedBy);
  },
});

export const acceptOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "shopper") {
      throw new Error("Nur Shopper können Bestellungen annehmen");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden");
    }

    if (order.acceptedBy && order.acceptedBy !== userId) {
      throw new Error("Bestellung wurde bereits übernommen");
    }

    if (order.status !== "offen") {
      throw new Error("Nur offene Bestellungen können angenommen werden");
    }

    await ctx.db.patch(args.orderId, {
      acceptedBy: userId,
      status: "in_bearbeitung",
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("offen"),
      v.literal("in_bearbeitung"),
      v.literal("geliefert"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "shopper") {
      throw new Error("Nur Shopper dürfen den Status ändern");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden");
    }

    if (order.acceptedBy !== userId) {
      throw new Error("Nur der übernehmende Shopper kann aktualisieren");
    }

    if (order.status === "offen") {
      throw new Error("Offene Bestellungen zuerst übernehmen");
    }

    const nextAllowed = allowedTransitions[order.status];
    if (!nextAllowed.includes(args.status)) {
      throw new Error("Ungültiger Statusübergang");
    }

    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

export const setProductCompleted = mutation({
  args: {
    orderId: v.id("orders"),
    index: v.number(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role !== "shopper") {
      throw new Error("Nur Shopper dürfen Produkte abhaken");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden");
    }

    if (order.acceptedBy !== userId) {
      throw new Error("Nur der übernehmende Shopper kann Produkte abhaken");
    }

    if (order.status === "geliefert") {
      throw new Error(
        "Abgeschlossene Bestellungen können nicht geändert werden",
      );
    }

    if (args.index < 0 || args.index >= order.products.length) {
      throw new Error("Ungültiger Produktindex");
    }

    const products = order.products.map((product, idx) =>
      idx === args.index ? { ...product, completed: args.completed } : product,
    );

    await ctx.db.patch(args.orderId, { products });
  },
});
