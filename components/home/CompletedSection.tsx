"use client";

import { Doc } from "@/convex/_generated/dataModel";
import OrderCard from "./OrderCard";

export default function CompletedSection({
  orders,
  profile,
}: {
  orders: Doc<"orders">[] | undefined | null;
  profile: {
    role: "benutzer" | "shopper";
    fullName: string;
    profileId: Doc<"profiles">["_id"] | null;
    userId: Doc<"users">["_id"];
  } | null;
}) {
  const count = orders?.length ?? 0;
  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <details className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-slate-200">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
        <span>Abgeschlossene Bestellungen</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-100">
          {orders === undefined ? "…" : count}
        </span>
      </summary>

      <div className="mt-3 space-y-3 text-sm text-slate-300">
        {orders === undefined ? (
          <div className="text-slate-400">Lädt…</div>
        ) : !hasOrders ? (
          <div className="text-slate-400">
            Keine abgeschlossenen Bestellungen.
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              profile={profile ?? null}
            />
          ))
        )}
      </div>
    </details>
  );
}
