"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { getNavGroups, isNavActive, type NavGroup, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

type Tab = "main" | "support";

const SUPPORT_HREFS = new Set(["/cham-soc", "/showcase", "/cai-dat"]);

function MenuTile({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavActive(item.href, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex min-w-0 flex-col items-center gap-2"
    >
      <span
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-[12px] transition",
          active
            ? "bg-[var(--brand-500)] text-white"
            : "bg-[var(--brand-50)] text-[var(--brand-600)] group-hover:bg-[var(--brand-100)]",
        )}
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="max-w-full text-center text-xs font-medium leading-tight text-slate-800">
        {item.label}
      </span>
    </Link>
  );
}

function GroupCard({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  if (!group.items.length) return null;
  return (
    <section
      className="rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-sm dark:bg-slate-900"
      aria-label={group.label}
    >
      <h2 className="text-sm font-bold text-slate-900">{group.label}</h2>
      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-5">
        {group.items.map((item) => (
          <MenuTile key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </section>
  );
}

export function MobileMenuPage() {
  const pathname = usePathname();
  const router = useRouter();
  const vertical = useVertical();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const settings = useLiveQuery(() => db.settings.get("store"));
  const [tab, setTab] = useState<Tab>("main");

  const { mainGroups, supportItems } = useMemo(() => {
    const groups = getNavGroups(vertical).map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          !user || !item.permission || user.permissions[item.permission],
      ),
    }));

    const mainGroups = groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => !SUPPORT_HREFS.has(item.href)),
      }))
      .filter((g) => g.items.length > 0);

    const supportItems = groups
      .flatMap((g) => g.items)
      .filter((item) => SUPPORT_HREFS.has(item.href));

    return { mainGroups, supportItems };
  }, [user, vertical]);

  const initial = (user?.name?.trim().charAt(0) || "U").toUpperCase();

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-sm dark:bg-slate-900">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ background: "var(--brand-500)" }}
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{user.name}</p>
              <p className="truncate text-xs text-slate-500">
                {user.role === "owner" ? "Chủ" : "Nhân viên"}
                {settings?.name ? ` · ${settings.name}` : ""}
              </p>
            </div>
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label="Menu"
          className="flex gap-1 rounded-[12px] border border-[var(--border)] bg-white p-1 shadow-sm dark:bg-slate-900"
        >
          {(
            [
              { id: "main" as const, label: "Quản lý" },
              { id: "support" as const, label: "Hỗ trợ" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "h-10 flex-1 rounded-[10px] text-sm font-semibold transition",
                tab === t.id
                  ? "bg-[var(--brand-500)] text-white"
                  : "text-slate-500 hover:bg-[var(--brand-50)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "main" ? (
          <div className="flex flex-col gap-3">
            {mainGroups.map((group) => (
              <GroupCard key={group.id} group={group} pathname={pathname} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {supportItems.length > 0 ? (
              <section
                className="rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-sm dark:bg-slate-900"
                aria-label="Hỗ trợ"
              >
                <h2 className="text-sm font-bold">Hỗ trợ</h2>
                <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-5">
                  {supportItems.map((item) => (
                    <MenuTile
                      key={item.href}
                      item={item}
                      pathname={pathname}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[12px] border border-[var(--border)] bg-white p-2 shadow-sm dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="flex w-full items-center gap-3 rounded-[10px] px-2 py-3 text-left hover:bg-rose-50"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-rose-50 text-rose-600">
                  <LogOut size={20} />
                </span>
                <span className="text-sm font-semibold text-rose-600">
                  Đăng xuất
                </span>
              </button>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
