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
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-slate-200/90 bg-white/85 p-6 text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 dark:border-white/10 dark:bg-slate-800/80">
        <ListChecks className="h-6 w-6 text-cyan-600 dark:text-slate-300" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
