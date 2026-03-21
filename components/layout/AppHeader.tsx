"use client";

import SignOutButton from "@/components/layout/SignOutButton";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = new Set(["/signin"]);

export default function AppHeader() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.has(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-400/15 p-2 text-cyan-300">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-300">ShopAssist</p>
            <p className="text-xs text-slate-400">Lieferplattform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-white/5 bg-slate-900/70 p-1 text-sm font-medium text-slate-200">
            {[
              { href: "/", label: "Bestellungen" },
              { href: "/konto", label: "Konto" },
            ].map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 transition ${active ? "bg-cyan-400 text-slate-950" : "hover:bg-white/5"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
