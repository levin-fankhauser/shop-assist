"use client";

import { Clock3 } from "lucide-react";

export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700/70" />
        <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700/70" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-600" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700/70" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700/70" />
          <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700/70" />
        </div>
      </div>
    </div>
  );
}
