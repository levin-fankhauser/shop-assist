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
      <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Lade Kontodaten…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-12 pt-8 text-slate-100">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
          <ShieldCheck className="h-4 w-4" /> Konto & Rolle
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Kontoeinstellungen
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Passe deinen Namen an und wähle, ob du als Benutzer oder Shopper
          arbeitest.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
          <h2 className="text-lg font-semibold text-white">Profil</h2>
          <p className="text-sm text-slate-300">
            Diese Infos helfen, dich zuzuordnen.
          </p>

          <div className="mt-4 space-y-2">
            <label
              className="text-sm font-medium text-white"
              htmlFor="fullName"
            >
              Name
            </label>
            <input
              id="fullName"
              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-300/70"
              placeholder="z. B. Alex Becker"
              value={currentFullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Rolle</h2>
              <p className="text-sm text-slate-300">
                Wähle, wie du die Plattform nutzt.
              </p>
            </div>
            {status === "saved" && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
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
                      ? "border-cyan-300/60 bg-cyan-400/10 text-white shadow-cyan-500/10"
                      : "border-white/10 bg-slate-950/50 text-slate-100 hover:border-cyan-300/40"
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
                  <p className="text-sm text-slate-200/80">
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
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
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
              className="text-sm font-medium text-cyan-100 underline decoration-2 underline-offset-4 hover:text-cyan-50"
            >
              Zur Übersicht
            </Link>
          </div>

          {error && (
            <p className="mt-3 text-sm text-rose-200">Fehler: {error}</p>
          )}
        </section>
      </div>
    </main>
  );
}
