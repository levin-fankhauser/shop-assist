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

    const orderId = await ctx.db.insert("orders", {
      title,
      products: args.products,
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
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Nicht angemeldet");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .order("desc")
      .take(50);

    return orders;
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

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Bestellung nicht gefunden");
    }

    if (order.createdBy !== userId) {
      throw new Error("Keine Berechtigung für diese Bestellung");
    }

    const nextAllowed = allowedTransitions[order.status];
    if (!nextAllowed.includes(args.status)) {
      throw new Error("Ungültiger Statusübergang");
    }

    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
