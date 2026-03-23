import { Doc } from "@/convex/_generated/dataModel";

type OrderStatus = Doc<"orders">["status"];

export type StatusMeta = {
  label: string;
  dotClass: string;
  pillClass: string;
  next: OrderStatus | null;
};

export const statusMeta: Record<OrderStatus, StatusMeta> = {
  offen: {
    label: "Offen",
    dotClass: "bg-amber-400",
    pillClass:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-300/40 dark:bg-amber-400/10 dark:text-amber-100",
    next: "in_bearbeitung",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    dotClass: "bg-cyan-400",
    pillClass:
      "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-300/40 dark:bg-cyan-400/10 dark:text-cyan-100",
    next: "geliefert",
  },
  geliefert: {
    label: "Geliefert",
    dotClass: "bg-emerald-400",
    pillClass:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-300/40 dark:bg-emerald-400/10 dark:text-emerald-100",
    next: null,
  },
};
