"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import CompletedSection from "./CompletedSection";
import EmptyState from "./EmptyState";
import OrderCard from "./OrderCard";
import SkeletonCard from "./SkeletonCard";

export default function OrderList() {
  const profile = useQuery(api.profiles.getProfile);
  const isShopper = profile?.role === "shopper";
  const orders = useQuery(
    api.orders.listOrders,
    isShopper ? { scope: "all" } : {},
  );

  const acceptedByMe = useQuery(
    api.orders.listAcceptedByMe,
    isShopper ? {} : "skip",
  );
  const availableForMe = useQuery(
    api.orders.listAvailableForShopper,
    isShopper ? {} : "skip",
  );

  const completedOrders = useQuery(
    api.orders.listCompletedOrders,
    isShopper ? { scope: "all" } : {},
  );

  const loadingShopper =
    isShopper && (acceptedByMe === undefined || availableForMe === undefined);

  const loadingUser = !isShopper && completedOrders === undefined;

  if (orders === undefined || loadingShopper || loadingUser) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const hasCompleted = (completedOrders?.length ?? 0) > 0;

  if (!isShopper && (!orders || orders.length === 0) && !hasCompleted) {
    return (
      <EmptyState
        title="Noch keine Bestellungen"
        subtitle="Lege los mit „Bestellung aufgeben“, um deine erste Bestellung zu speichern."
      />
    );
  }

  if (isShopper) {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-200">
                Übernommen
              </p>
              <h3 className="text-lg font-semibold text-white">
                Meine aktiven Bestellungen
              </h3>
            </div>
          </header>

          {acceptedByMe && acceptedByMe.length > 0 ? (
            <div className="space-y-4">
              {acceptedByMe.map((order: Doc<"orders">) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  profile={profile ?? null}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Noch nichts übernommen"
              subtitle="Wähle eine Bestellung aus der offenen Liste."
            />
          )}
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Offene Bestellungen
              </p>
              <h3 className="text-lg font-semibold text-white">
                Verfügbar zur Übernahme
              </h3>
            </div>
          </header>

          {availableForMe && availableForMe.length > 0 ? (
            <div className="space-y-4">
              {availableForMe.map((order: Doc<"orders">) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  profile={profile ?? null}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Keine offenen Bestellungen"
              subtitle="Sobald neue Bestellungen reinkommen, kannst du sie übernehmen."
            />
          )}
        </section>

        <CompletedSection orders={completedOrders} profile={profile ?? null} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: Doc<"orders">) => (
        <OrderCard key={order._id} order={order} profile={profile ?? null} />
      ))}

      <CompletedSection orders={completedOrders} profile={profile ?? null} />
    </div>
  );
}
