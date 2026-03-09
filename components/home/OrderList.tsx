"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Clock3, ListChecks } from "lucide-react";
import OrderCard from "./OrderCard";

export default function OrderList() {
  const orders = useQuery(api.orders.listOrders);

  if (orders === undefined) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-slate-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80">
          <ListChecks className="h-6 w-6 text-slate-300" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">
            Noch keine Bestellungen
          </p>
          <p className="text-sm text-slate-400">
            Lege los mit „Bestellung aufgeben“, um deine erste Bestellung zu
            speichern.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Doc<"orders">) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-700/70" />
        <div className="h-6 w-20 rounded-full bg-slate-700/70" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <Clock3 className="h-4 w-4 text-slate-600" />
          <div className="h-4 w-24 rounded bg-slate-700/70" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-slate-700/70" />
          <div className="h-4 w-28 rounded bg-slate-700/70" />
        </div>
      </div>
    </div>
  );
}
