import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("customer"), v.literal("shopper")),
  }).index("by_userId", ["userId"]),
  orders: defineTable({
    customerId: v.id("users"),
    shopperId: v.optional(v.id("users")),
    title: v.string(),
    notes: v.optional(v.string()),
    items: v.array(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("delivered"),
    ),
  })
    .index("by_customerId", ["customerId"])
    .index("by_status", ["status"])
    .index("by_shopperId_and_status", ["shopperId", "status"]),
});
