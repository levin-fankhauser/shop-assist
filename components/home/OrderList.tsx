"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Clock3, ListChecks } from "lucide-react";
import OrderCard from "./OrderCard";

export default function OrderList() {
  const profile = useQuery(api.profiles.getProfile);
  const isShopper = profile?.role === "shopper";
  const orders = useQuery(
    api.orders.listOrders,
    isShopper ? { scope: "all" } : {},
  );

  const acceptedByMe = useQuery(
    api.orders.listAcceptedByMe,
    {},
    { enabled: Boolean(isShopper) },
  );
  const availableForMe = useQuery(
    api.orders.listAvailableForShopper,
    {},
    { enabled: Boolean(isShopper) },
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

function CompletedSection({
  orders,
  profile,
}: {
  orders: Doc<"orders">[] | undefined | null;
  profile: Doc<"profiles"> | null;
}) {
  const count = orders?.length ?? 0;

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
        ) : count === 0 ? (
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

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80">
        <ListChecks className="h-6 w-6 text-slate-300" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
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
