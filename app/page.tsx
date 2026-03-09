"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <p className="p-10 text-center text-stone-700">Lade ShopAssist...</p>
    );
  }

  if (!isAuthenticated) {
    return <p className="p-10 text-center text-stone-700">Bitte anmelden.</p>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fef3c7_0%,_#ffedd5_25%,_#fee2e2_55%,_#f8fafc_100%)] text-stone-900">
      <header className="sticky top-0 z-10 border-b border-amber-200/70 bg-white/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
              ShopAssist MVP
            </p>
            <h1 className="font-title text-2xl">Einkaufsservice</h1>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <Content />
      </main>
    </div>
  );
}

function Content() {
  const viewer = useQuery(api.users.getViewer);

  if (viewer === undefined) {
    return <p className="text-stone-700">Profil wird geladen...</p>;
  }

  if (viewer === null || viewer.role === null) {
    return <RoleSelection />;
  }

  return viewer.role === "customer" ? (
    <CustomerDashboard />
  ) : (
    <ShopperDashboard />
  );
}

function RoleSelection() {
  const setRole = useMutation(api.users.setRole);

  return (
    <section className="grid gap-4 rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm md:grid-cols-2">
      <RoleCard
        title="Ich brauche Hilfe beim Einkauf"
        description="Erstelle Einkaufslisten und lass sie von einem Shopper erledigen."
        cta="Als User starten"
        onClick={() => void setRole({ role: "customer" })}
      />
      <RoleCard
        title="Ich moechte Bestellungen ausliefern"
        description="Sieh offene Auftraege, uebernimm einen Auftrag und markiere ihn als geliefert."
        cta="Als Shopper starten"
        onClick={() => void setRole({ role: "shopper" })}
      />
    </section>
  );
}

function RoleCard({
  title,
  description,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-5">
      <h2 className="font-title text-xl">{title}</h2>
      <p className="text-sm text-stone-700">{description}</p>
      <button
        className="mt-auto rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
        onClick={onClick}
      >
        {cta}
      </button>
    </article>
  );
}

function CustomerDashboard() {
  const createOrder = useMutation(api.orders.createOrder);
  const orders = useQuery(api.orders.listCustomerOrders) ?? [];
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [itemsInput, setItemsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const itemCount = useMemo(
    () =>
      itemsInput
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0).length,
    [itemsInput],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createOrder({
        title,
        notes: notes.length > 0 ? notes : undefined,
        items: itemsInput.split("\n"),
      });
      setTitle("");
      setNotes("");
      setItemsInput("");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Bestellung konnte nicht erstellt werden.";
      setError(message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm">
        <h2 className="font-title text-2xl">Neue Einkaufsliste</h2>
        <p className="mt-1 text-sm text-stone-700">
          Trenne Artikel mit Zeilenumbruechen. Status startet immer mit `open`.
        </p>
        <form className="mt-5 flex flex-col gap-3" onSubmit={onSubmit}>
          <input
            className="rounded-lg border border-amber-200 bg-white px-3 py-2"
            placeholder="Titel, z.B. Wocheneinkauf"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <textarea
            className="min-h-28 rounded-lg border border-amber-200 bg-white px-3 py-2"
            placeholder="Artikel pro Zeile, z.B.\nMilch\nBrot\nAepfel"
            value={itemsInput}
            onChange={(event) => setItemsInput(event.target.value)}
            required
          />
          <textarea
            className="min-h-20 rounded-lg border border-amber-200 bg-white px-3 py-2"
            placeholder="Optionale Hinweise (Budget, Marke, etc.)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <p className="text-xs text-stone-600">
            Erfasste Artikel: {itemCount}
          </p>
          {error && <p className="text-sm font-medium text-red-700">{error}</p>}
          <button
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            type="submit"
          >
            Bestellung speichern
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm">
        <h2 className="font-title text-2xl">Meine Bestellungen</h2>
        <OrderList orders={orders} showActions={false} />
      </section>
    </div>
  );
}

function ShopperDashboard() {
  const openOrders = useQuery(api.orders.listOpenOrders) ?? [];
  const myOrders = useQuery(api.orders.listShopperOrders) ?? [];
  const acceptOrder = useMutation(api.orders.acceptOrder);
  const markDelivered = useMutation(api.orders.markDelivered);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm">
        <h2 className="font-title text-2xl">Offene Bestellungen</h2>
        <OrderList
          orders={openOrders}
          showActions
          onAccept={(orderId) => void acceptOrder({ orderId })}
        />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-sm">
        <h2 className="font-title text-2xl">Meine Auftraege</h2>
        <OrderList
          orders={myOrders}
          showActions
          onDeliver={(orderId) => void markDelivered({ orderId })}
        />
      </section>
    </div>
  );
}

function OrderList({
  orders,
  showActions,
  onAccept,
  onDeliver,
}: {
  orders: Array<{
    _id: Id<"orders">;
    title: string;
    status: "open" | "in_progress" | "delivered";
    items: string[];
    notes?: string;
  }>;
  showActions: boolean;
  onAccept?: (orderId: Id<"orders">) => void;
  onDeliver?: (orderId: Id<"orders">) => void;
}) {
  if (orders.length === 0) {
    return (
      <p className="mt-4 text-sm text-stone-600">
        Keine Bestellungen vorhanden.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {orders.map((order) => (
        <li
          key={order._id}
          className="rounded-xl border border-amber-100 bg-amber-50/50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-stone-900">{order.title}</h3>
              <p className="text-xs text-stone-600">
                {order.items.join(" - ")}
              </p>
              {order.notes && (
                <p className="mt-1 text-xs text-stone-700">
                  Hinweis: {order.notes}
                </p>
              )}
            </div>
            <StatusPill status={order.status} />
          </div>
          {showActions && order.status === "open" && onAccept && (
            <button
              className="mt-3 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
              onClick={() => onAccept(order._id)}
            >
              Auftrag uebernehmen
            </button>
          )}
          {showActions && order.status === "in_progress" && onDeliver && (
            <button
              className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              onClick={() => onDeliver(order._id)}
            >
              Als geliefert markieren
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusPill({
  status,
}: {
  status: "open" | "in_progress" | "delivered";
}) {
  const label =
    status === "open"
      ? "offen"
      : status === "in_progress"
        ? "in Bearbeitung"
        : "geliefert";

  const classes =
    status === "open"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : status === "in_progress"
        ? "bg-sky-100 text-sky-800 border-sky-200"
        : "bg-emerald-100 text-emerald-800 border-emerald-200";

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <button
      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
      onClick={() =>
        void signOut().then(() => {
          router.push("/signin");
        })
      }
    >
      Abmelden
    </button>
  );
}
