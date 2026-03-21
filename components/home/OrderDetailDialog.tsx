"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useState } from "react";
import { statusMeta, type StatusMeta } from "./orderStatusMeta";

type Order = Doc<"orders">;

type Props = {
  order: Order;
  meta: StatusMeta;
  nextStatus: Order["status"] | null;
  nextStatusLabel: string | null;
  isShopper: boolean;
  acceptedByMe: boolean;
  acceptedBySomeoneElse: boolean;
  onAccept: () => Promise<void>;
  onAdvance: () => Promise<void>;
  onClose: () => void;
  isUpdating: boolean;
  error: string | null;
  acceptedByName: string | null;
};

export default function OrderDetailDialog({
  order,
  meta,
  nextStatus,
  nextStatusLabel,
  isShopper,
  acceptedByMe,
  acceptedBySomeoneElse,
  onAccept,
  onAdvance,
  onClose,
  isUpdating,
  error,
  acceptedByName,
}: Props) {
  const setProductCompleted = useMutation(api.orders.setProductCompleted);
  const [productError, setProductError] = useState<string | null>(null);
  const [updatingProductIndex, setUpdatingProductIndex] = useState<
    number | null
  >(null);

  const canToggleProducts =
    isShopper && acceptedByMe && order.status !== "geliefert";

  const handleToggleProduct = async (index: number, completed: boolean) => {
    if (!canToggleProducts) return;
    setProductError(null);
    setUpdatingProductIndex(index);
    try {
      await setProductCompleted({ orderId: order._id, index, completed });
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Aktualisierung fehlgeschlagen",
      );
    } finally {
      setUpdatingProductIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/60">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Details & Status
            </p>
            <h3 className="text-2xl font-semibold text-white">{order.title}</h3>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
            onClick={onClose}
          >
            Schließen
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.pillClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
          {order.acceptedBy && (
            <span className="rounded-full border border-white/10 bg-slate-800 px-3 py-1 text-xs text-slate-200">
              {acceptedByMe
                ? "Von dir übernommen"
                : acceptedByName
                  ? `Von Shopper: ${acceptedByName} übernommen`
                  : "Von Shopper übernommen"}
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Produkte
            </p>
            <ul className="mt-3 space-y-3 text-white">
              {order.products.map((item, idx) => {
                const completed = Boolean(item.completed);

                return (
                  <li
                    key={`${item.name}-${item.quantity}-${idx}`}
                    className="flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-300"
                      checked={completed}
                      disabled={
                        !canToggleProducts || updatingProductIndex === idx
                      }
                      onChange={(e) =>
                        handleToggleProduct(idx, e.currentTarget.checked)
                      }
                    />
                    <div className="space-y-1">
                      <div className="font-medium">
                        <span
                          className={
                            completed
                              ? "text-slate-400 line-through"
                              : "text-white"
                          }
                        >
                          {item.quantity}× {item.name}
                        </span>
                      </div>
                      {item.note && (
                        <div className="text-xs text-slate-400">
                          ({item.note})
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {productError && (
              <p className="mt-3 text-sm text-rose-200">
                Fehler: {productError}
              </p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/60 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Adresse
              </p>
              <p className="mt-1 font-semibold text-white">
                {order.deliveryAddress}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Lieferzeit
              </p>
              <p className="mt-1 font-semibold text-white">
                {formatDate(order.desiredDeliveryTime)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Erstellt
              </p>
              <p className="mt-1 font-semibold text-white">
                {formatDate(order._creationTime)}
              </p>
            </div>
          </div>
        </div>

        {order.additionalNotes && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-800/80 p-4 text-sm text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Hinweise
            </p>
            <p className="mt-1 leading-relaxed text-white">
              {order.additionalNotes}
            </p>
          </div>
        )}

        {isShopper && (
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-800/80 p-4 text-sm text-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Status ändern
                </p>
                <p className="text-sm text-slate-300">
                  Änderungen sind nur im Detail erlaubt.
                </p>
              </div>
              <div className="text-xs text-slate-400">
                Offen → In Bearbeitung → Geliefert
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {order.status === "offen" && !acceptedBySomeoneElse && (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/70"
                  onClick={onAccept}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Übernehme…
                    </>
                  ) : (
                    <>
                      Bestellung übernehmen
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {order.status === "offen" && acceptedBySomeoneElse && (
                <p className="text-sm text-slate-400">
                  {acceptedByName
                    ? `Bereits von Shopper: ${acceptedByName} übernommen.`
                    : "Bereits von einem anderen Shopper übernommen."}
                </p>
              )}

              {acceptedByMe && nextStatus && order.status !== "offen" && (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/50 hover:text-cyan-100"
                  onClick={onAdvance}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aktualisiere…
                    </>
                  ) : (
                    <>
                      Status auf{" "}
                      {nextStatusLabel ?? statusMeta[nextStatus].label} setzen
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {order.status === "geliefert" && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
                  Abgeschlossen
                </div>
              )}

              {!acceptedByMe && order.status === "in_bearbeitung" && (
                <p className="text-sm text-slate-400">
                  Nur der Shopper, der übernommen hat, kann den Status ändern.
                </p>
              )}

              {error && (
                <p className="text-sm text-rose-200">Fehler: {error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string | number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
