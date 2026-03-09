"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="rounded-lg border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/70 hover:bg-rose-400/20"
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
