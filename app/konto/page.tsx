"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Role = "benutzer" | "shopper";

const roleOptions: Array<{
  value: Role;
  title: string;
  description: string;
}> = [
  {
    value: "benutzer",
    title: "Benutzer",
    description: "Bestellungen erfassen und eigenen Status verfolgen.",
  },
  {
    value: "shopper",
    title: "Shopper",
    description: "Alle Bestellungen sehen und Status aktualisieren.",
  },
];

export default function KontoPage() {
  const profile = useQuery(api.profiles.getProfile);
  const upsertProfile = useMutation(api.profiles.upsertProfile);

  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const profileFullName = profile?.fullName ?? "";
  const profileRole: Role = profile?.role ?? "benutzer";

  const currentFullName = fullName ?? profileFullName;
  const currentRole: Role = role ?? profileRole;

  const save = async () => {
    setStatus("saving");
    setError(null);
    try {
      await upsertProfile({
        fullName: currentFullName.trim() || undefined,
        role: currentRole,
      });
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  };

  if (profile === undefined) {
    return (
      <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 text-slate-800">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            <p>Lade Kontodaten…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 text-slate-800 dark:text-slate-100">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-800 shadow-sm dark:bg-cyan-400/10 dark:text-cyan-100">
          <ShieldCheck className="h-4 w-4" /> Konto & Rolle
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          Kontoeinstellungen
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Passe deinen Namen an und wähle, ob du als Benutzer oder Shopper
          arbeitest.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Profil
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Diese Infos helfen, dich zuzuordnen.
          </p>

          <div className="mt-4 space-y-2">
            <label
              className="text-sm font-medium text-slate-800 dark:text-white"
              htmlFor="fullName"
            >
              Name
            </label>
            <input
              id="fullName"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
              placeholder="z. B. Alex Becker"
              value={currentFullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Rolle
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Wähle, wie du die Plattform nutzt.
              </p>
            </div>
            {status === "saved" && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-300/40 dark:bg-emerald-400/10 dark:text-emerald-100">
                <CheckCircle2 className="h-4 w-4" /> Gespeichert
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const active = currentRole === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`flex h-full flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-cyan-300 bg-cyan-50 text-slate-900 shadow-[0_10px_30px_rgba(34,211,238,0.25)] dark:border-cyan-300/60 dark:bg-cyan-400/10 dark:text-white dark:shadow-cyan-500/10"
                      : "border-slate-200 bg-white text-slate-800 hover:border-cyan-400/60 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100 dark:hover:border-cyan-300/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {option.value === "benutzer" ? (
                      <UserRound className="h-5 w-5" />
                    ) : (
                      <BadgeCheck className="h-5 w-5" />
                    )}
                    <span className="text-base font-semibold">
                      {option.title}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-200/80">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={status === "saving"}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60 dark:text-slate-950"
            >
              {status === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Speichere…
                </>
              ) : (
                "Änderungen speichern"
              )}
            </button>

            <Link
              href="/"
              className="text-sm font-medium text-cyan-700 underline decoration-2 underline-offset-4 hover:text-cyan-900 dark:text-cyan-100 dark:hover:text-cyan-50"
            >
              Zur Übersicht
            </Link>
          </div>

          {error && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-200">
              Fehler: {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
