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
    pillClass: "border-amber-300/40 bg-amber-400/10 text-amber-100",
    next: "in_bearbeitung",
  },
  in_bearbeitung: {
    label: "In Bearbeitung",
    dotClass: "bg-cyan-400",
    pillClass: "border-cyan-300/40 bg-cyan-400/10 text-cyan-100",
    next: "geliefert",
  },
  geliefert: {
    label: "Geliefert",
    dotClass: "bg-emerald-400",
    pillClass: "border-emerald-300/40 bg-emerald-400/10 text-emerald-100",
    next: null,
  },
};
