"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Plus, X } from "lucide-react";
import { FormEvent, useState } from "react";

type ProductInput = {
  name: string;
  quantity: number;
  note?: string;
};

const emptyProduct: ProductInput = { name: "", quantity: 1, note: "" };

export default function OrderFormDialog({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [desiredDeliveryTime, setDesiredDeliveryTime] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [products, setProducts] = useState<ProductInput[]>([
    { ...emptyProduct },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useMutation(api.orders.createOrder);

  const resetForm = () => {
    setTitle("");
    setDeliveryAddress("");
    setDesiredDeliveryTime("");
    setAdditionalNotes("");
    setProducts([{ ...emptyProduct }]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createOrder({
        title: title.trim(),
        deliveryAddress: deliveryAddress.trim(),
        desiredDeliveryTime: desiredDeliveryTime.trim(),
        additionalNotes: additionalNotes.trim() || undefined,
        products: products.map((product) => ({
          name: product.name.trim(),
          quantity: Number(product.quantity),
          note: product.note?.trim() || undefined,
        })),
      });
      resetForm();
      setIsOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="w-full rounded-2xl bg-linear-to-r from-cyan-400 to-emerald-400 px-5 py-4 text-left text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-400/40"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-900/70">
              Bestellung aufgeben
            </p>
            <h2 className="text-2xl font-bold">Neue Bestellung erfassen</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Plus className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-900/80">
          Erfasse Titel, Produkte und Lieferdetails in wenigen Klicks.
        </p>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-6 text-slate-800 shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:border-white/15 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-slate-950/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Neue Bestellung
                </p>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Bestellformular
                </h3>
              </div>
              <button
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/10 dark:text-slate-300 dark:hover:border-rose-300/50 dark:hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Dialog schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-white">
                  Titel
                </label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z. B. Wocheneinkauf Familie Müller"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-800 dark:text-white">
                    Produkte
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-cyan-800 shadow-sm transition hover:border-cyan-500/60 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-900 dark:text-cyan-100 dark:hover:border-cyan-300/60"
                    onClick={() =>
                      setProducts((current) => [
                        ...current,
                        { ...emptyProduct },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Produkt hinzufügen
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/50"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-center">
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                          value={product.name}
                          onChange={(e) =>
                            setProducts((current) =>
                              current.map((item, i) =>
                                i === index
                                  ? { ...item, name: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Produktname"
                          required
                        />
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                          type="number"
                          min={1}
                          value={product.quantity}
                          onChange={(e) =>
                            setProducts((current) =>
                              current.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      quantity: Number(e.target.value),
                                    }
                                  : item,
                              ),
                            )
                          }
                          placeholder="Menge"
                          required
                        />
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-white/10 dark:text-slate-200 dark:hover:border-rose-300/50 dark:hover:text-rose-100"
                          onClick={() =>
                            setProducts((current) =>
                              current.length === 1
                                ? current
                                : current.filter((_, i) => i !== index),
                            )
                          }
                          aria-label="Produkt entfernen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                        placeholder="Optionale Bemerkung"
                        value={product.note}
                        onChange={(e) =>
                          setProducts((current) =>
                            current.map((item, i) =>
                              i === index
                                ? { ...item, note: e.target.value }
                                : item,
                            ),
                          )
                        }
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-white">
                    Lieferadresse
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-white">
                    Gewünschte Lieferzeit
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                    type="datetime-local"
                    value={desiredDeliveryTime}
                    onChange={(e) => setDesiredDeliveryTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-white">
                  Zusätzliche Hinweise
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-cyan-300/70 dark:focus:ring-0"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Optional: Klingeln, Etage, Allergien, ..."
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-sm text-rose-600 dark:text-rose-200">
                  Fehler: {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/30"
                  onClick={() => setIsOpen(false)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 dark:text-slate-950"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Speichert..." : "Bestellung speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
