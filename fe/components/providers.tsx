"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ensureSeeded } from "@/lib/seed";
import { useAuthStore } from "@/stores/auth-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const [ready, setReady] = useState(false);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensureSeeded();
      if (alive) {
        setReady(true);
        setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [setHydrated]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
