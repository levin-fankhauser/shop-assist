"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import OrderFormDialog from "@/components/home/OrderFormDialog";
import OrderList from "@/components/home/OrderList";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Home() {
  const profile = useQuery(api.profiles.getProfile);

  if (profile === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-slate-950/50">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_85%_65%,rgba(16,185,129,0.18),transparent_32%)]" />
            <div className="relative flex items-center gap-3 text-slate-700 dark:text-slate-200">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
              <p>Lade dein Profil…</p>
            </div>
          </section>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Vergangene Bestellungen
                </p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Übersicht & Status
                </h2>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
              Lädt…
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isShopper = profile.role === "shopper";

  if (isShopper) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-100">
              Shopper-Ansicht
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              Alle Bestellungen der Nutzer
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">
              Durchsuche und bearbeite die Bestellungen, die von allen Benutzern
              erstellt wurden.
            </p>
          </div>
          <Link
            href="/konto"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-cyan-500/60 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
          >
            Rolle wechseln
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
          <p className="font-medium text-slate-900 dark:text-white">
            Globale Übersicht
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Du siehst alle Bestellungen. Wechsle die Rolle im Konto, um wieder
            nur eigene Bestellungen und das Formular zu sehen.
          </p>
        </div>

        <div className="mt-6">
          <OrderList />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/85 dark:shadow-slate-950/50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_85%_65%,rgba(16,185,129,0.18),transparent_32%)]" />

          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800 shadow-sm dark:bg-white/5 dark:text-cyan-100">
              Einkauf & Lieferung
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              Bestellung aufgeben
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">
              Erfasse deine Bestellung mit Titeln, Produkten und Lieferdetails.
              Alles läuft über Convex, damit der Status immer aktuell bleibt.
            </p>

            <OrderFormDialog />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Vergangene Bestellungen
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Übersicht & Status
              </h2>
            </div>
            <div className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
              Offen → In Bearbeitung → Geliefert
            </div>
          </div>

          <OrderList />
        </section>
      </div>
    </main>
  );
}
