"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.18),transparent_36%)]" />

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-8 dark:border-white/10 dark:bg-slate-900/75 dark:shadow-cyan-950/30">
          <div className="inline-flex rounded-xl bg-cyan-500/15 p-3 text-cyan-600 dark:text-cyan-300">
            <ShoppingBag className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Willkommen bei ShopAssist
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {flow === "signIn"
              ? "Melde dich an, um weiterzumachen."
              : "Erstelle dein Konto und starte direkt."}
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", flow);

              void signIn("password", formData)
                .then(() => {
                  router.push("/");
                })
                .catch((signInError: Error) => {
                  setError(signInError.message);
                  setLoading(false);
                });
            }}
          >
            <input
              className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/15 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
              type="email"
              name="email"
              placeholder="E-Mail"
              required
            />

            <div className="space-y-1">
              <input
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/15 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                type="password"
                name="password"
                placeholder="Passwort"
                minLength={8}
                required
              />
              {flow === "signUp" && (
                <p className="px-1 text-xs text-slate-400">
                  Passwort muss mindestens 8 Zeichen haben.
                </p>
              )}
            </div>

            <button
              className="cursor-pointer rounded-lg bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-950"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Laedt..."
                : flow === "signIn"
                  ? "Anmelden"
                  : "Registrieren"}
            </button>

            <div className="flex flex-row justify-center gap-2 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {flow === "signIn"
                  ? "Noch kein Konto?"
                  : "Bereits registriert?"}
              </span>
              <button
                type="button"
                className="cursor-pointer font-medium text-cyan-700 underline decoration-2 underline-offset-2 transition hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-100"
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
              >
                {flow === "signIn" ? "Registrieren" : "Anmelden"}
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-400/40 dark:bg-rose-500/10">
                <p className="wrap-break-word text-sm font-medium text-rose-700 dark:text-rose-200">
                  Fehler: {error}
                </p>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
