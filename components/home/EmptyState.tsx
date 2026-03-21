"use client";

import { ListChecks } from "lucide-react";

export default function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80">
        <ListChecks className="h-6 w-6 text-slate-300" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
