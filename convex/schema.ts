import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  orders: defineTable({
    title: v.string(),
    products: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        note: v.optional(v.string()),
      }),
    ),
    deliveryAddress: v.string(),
    desiredDeliveryTime: v.string(),
    additionalNotes: v.optional(v.string()),
    status: v.union(
      v.literal("offen"),
      v.literal("in_bearbeitung"),
      v.literal("geliefert"),
    ),
    createdBy: v.id("users"),
  }).index("by_createdBy", ["createdBy"]),
});
