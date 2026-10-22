"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureSeeded } from "@/lib/seed";
import { useAuthStore } from "@/stores/auth-store";

function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

const PUBLIC = new Set(["/login", "/showcase"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    void ensureSeeded().then(() => setReady(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !ready) return;
    if (!user && path !== "/login") {
      router.replace("/login");
      return;
    }
    if (user && path === "/login") {
      router.replace("/");
    }
  }, [hydrated, ready, user, path, router]);

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user && !PUBLIC.has(path)) return null;

  return <>{children}</>;
}
