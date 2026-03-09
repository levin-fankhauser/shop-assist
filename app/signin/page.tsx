"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#ffedd5_0%,#fde68a_45%,#fff7ed_100%)] px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 rounded-3xl bg-white/70 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
            ShopAssist MVP
          </p>
          <h1 className="mt-3 font-title text-4xl text-stone-900">
            Schneller einkaufen lassen
          </h1>
          <p className="mt-3 text-stone-700">
            Melde dich an, um Einkaufslisten zu erstellen oder als Shopper
            offene Auftraege zu uebernehmen.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-stone-700">
            <p>1. Rolle waehlen: User oder Shopper</p>
            <p>2. Bestellung erfassen oder uebernehmen</p>
            <p>3. Status von offen bis geliefert verfolgen</p>
          </div>
        </div>

        <form
          className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 shadow-xl"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData)
              .catch((error) => {
                setError(error.message);
                setLoading(false);
              })
              .then(() => {
                router.push("/");
              });
          }}
        >
          <h2 className="font-title text-2xl text-stone-900">
            {flow === "signIn" ? "Anmelden" : "Registrieren"}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Auth via Convex Password Provider
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <input
              className="rounded-lg border border-amber-200 bg-white px-3 py-3 text-stone-900"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <div className="flex flex-col gap-1">
              <input
                className="rounded-lg border border-amber-200 bg-white px-3 py-3 text-stone-900"
                type="password"
                name="password"
                placeholder="Passwort"
                minLength={8}
                required
              />
              {flow === "signUp" && (
                <p className="text-xs text-stone-500">
                  Passwort mit mindestens 8 Zeichen.
                </p>
              )}
            </div>
          </div>

          <button
            className="mt-5 w-full rounded-lg bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Bitte warten..."
              : flow === "signIn"
                ? "Anmelden"
                : "Registrieren"}
          </button>

          <div className="mt-4 flex flex-row gap-2 text-sm">
            <span className="text-stone-600">
              {flow === "signIn" ? "Noch kein Konto?" : "Bereits registriert?"}
            </span>
            <button
              className="font-semibold text-amber-800 underline"
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Jetzt registrieren" : "Zum Login"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700 break-words">
                Fehler: {error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
