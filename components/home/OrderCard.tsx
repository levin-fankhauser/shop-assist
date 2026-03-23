"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, BadgeCheck, Clock, MapPin, Package } from "lucide-react";
import { useMemo, useState } from "react";
import OrderDetailDialog from "./OrderDetailDialog";
import { statusMeta } from "./orderStatusMeta";

type Order = Doc<"orders">;

type ProfileInfo = {
  role: "benutzer" | "shopper";
  userId: Doc<"users">["_id"];
};

function formatDate(value: string | number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderCard({
  order,
  profile,
}: {
  order: Order;
  profile: ProfileInfo | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const acceptOrder = useMutation(api.orders.acceptOrder);

  const isShopper = profile?.role === "shopper";
  const isOwner = profile?.userId === order.createdBy;
  const acceptedByMe = order.acceptedBy === profile?.userId;
  const acceptedBySomeoneElse = Boolean(order.acceptedBy && !acceptedByMe);

  const acceptedByProfile = useQuery(
    api.profiles.getProfileByUserId,
    order.acceptedBy ? { userId: order.acceptedBy } : "skip",
  );
  const acceptedByName = acceptedByProfile?.fullName?.trim() || null;

  const meta = statusMeta[order.status];
  const nextStatus = meta.next;

  const productSummary = useMemo(() => {
    if (order.products.length === 0) return "-";
    const firstItems = order.products
      .slice(0, 2)
      .map((item) => `${item.quantity}× ${item.name}`)
      .join(", ");

    if (order.products.length > 2) {
      const remaining = order.products.length - 2;
      return `${firstItems} + ${remaining} weitere`;
    }

    return firstItems;
  }, [order.products]);

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setError(null);
    setIsUpdating(true);
    try {
      await updateStatus({ orderId: order._id, status: nextStatus });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Aktualisierung fehlgeschlagen",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccept = async () => {
    setError(null);
    setIsUpdating(true);
    try {
      await acceptOrder({ orderId: order._id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Übernahme fehlgeschlagen");
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetails = () => {
    setError(null);
    setIsDialogOpen(true);
  };

  const closeDetails = () => setIsDialogOpen(false);

  return (
    <>
      <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-slate-950/50">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Bestellung
            </p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {order.title}
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${meta.pillClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
        </header>

        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Package className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Produkte
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {productSummary}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Adresse
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {order.deliveryAddress}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Lieferzeit
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {formatDate(order.desiredDeliveryTime)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Erstellt
              </dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {formatDate(order._creationTime)}
              </dd>
            </div>
          </div>
        </dl>

        {order.additionalNotes && (
          <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50 p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Hinweise
            </p>
            <p className="mt-1 leading-relaxed">{order.additionalNotes}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Offen → In Bearbeitung → Geliefert</span>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-cyan-500/60 hover:text-cyan-700 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:hover:border-cyan-300/50 dark:hover:text-cyan-100"
            onClick={openDetails}
          >
            Details & Status
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {isShopper && order.acceptedBy && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {acceptedByMe
              ? "Von dir übernommen"
              : acceptedByName
                ? `Von Shopper: ${acceptedByName} übernommen`
                : "Von Shopper übernommen"}
          </p>
        )}

        {isOwner && !isShopper && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Deine Bestellung
          </p>
        )}
      </article>

      {isDialogOpen && (
        <OrderDetailDialog
          order={order}
          meta={meta}
          nextStatus={nextStatus}
          nextStatusLabel={nextStatus ? statusMeta[nextStatus].label : null}
          isShopper={isShopper}
          acceptedByMe={acceptedByMe}
          acceptedBySomeoneElse={acceptedBySomeoneElse}
          onAccept={handleAccept}
          onAdvance={handleAdvance}
          onClose={closeDetails}
          isUpdating={isUpdating}
          error={error}
          acceptedByName={acceptedByName}
        />
      )}
    </>
  );
}
