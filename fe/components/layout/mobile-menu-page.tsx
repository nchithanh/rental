"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { getNavGroups, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

export function MobileMenuPage() {
  const pathname = usePathname();
  const router = useRouter();
  const vertical = useVertical();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const settings = useLiveQuery(() => db.settings.get("store"));

  const items = useMemo(() => {
    return getNavGroups(vertical).flatMap((g) =>
      g.items.filter(
        (item) => !user || !item.permission || user.permissions[item.permission],
      ),
    );
  }, [user, vertical]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="rounded-[12px] border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="font-bold">{user?.name}</p>
          <p className="text-sm text-slate-500">{settings?.name}</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-600"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => {
            const active = isNavActive(item.href, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-[12px]",
                    active
                      ? "bg-[var(--brand-500)] text-white"
                      : "bg-[var(--brand-50)] text-[var(--brand-600)]",
                  )}
                >
                  <Icon size={22} />
                </span>
                <span className="text-center text-xs font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
