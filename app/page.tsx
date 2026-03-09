"use client";

import OrderFormDialog from "@/components/home/OrderFormDialog";
import OrderList from "@/components/home/OrderList";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(16,185,129,0.15),transparent_32%)]" />

          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
              Einkauf & Lieferung
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Bestellung aufgeben
            </h1>
            <p className="text-sm text-slate-200 sm:text-base">
              Erfasse deine Bestellung mit Titeln, Produkten und Lieferdetails.
              Alles läuft über Convex, damit der Status immer aktuell bleibt.
            </p>

            <OrderFormDialog />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Vergangene Bestellungen
              </p>
              <h2 className="text-xl font-semibold text-white">
                Übersicht & Status
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Offen → In Bearbeitung → Geliefert
            </div>
          </div>

          <OrderList />
        </section>
      </div>
    </main>
  );
}
