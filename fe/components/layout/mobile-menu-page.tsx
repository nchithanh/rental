"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { db } from "@/lib/db";
import { getNavGroups, isNavActive, type NavGroup, type NavItem } from "@/lib/nav";
import { useNavBadges } from "@/lib/nav-badges";
import { cn } from "@/lib/utils";
import { getVerticalCopy, useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

type Tab = "main" | "support";

const SUPPORT_HREFS = new Set(["/cham-soc", "/showcase", "/cai-dat"]);

function MenuTile({
  item,
  pathname,
  count,
}: {
  item: NavItem;
  pathname: string;
  count: number;
}) {
  const active = isNavActive(item.href, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group relative flex min-w-0 flex-col items-center gap-2 rounded-[12px] px-1 py-2 transition"
    >
      <span
        className={cn(
          "relative inline-flex h-12 w-12 items-center justify-center rounded-[12px] transition",
          active
            ? "bg-transparent text-[var(--brand-600)]"
            : "bg-[var(--brand-50)] text-slate-900 group-hover:bg-[var(--brand-100)]",
        )}
      >
        <Icon
          size={22}
          strokeWidth={active ? 2.25 : 1.75}
          className={active ? "text-[var(--brand-600)]" : undefined}
        />
        {count > 0 ? (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-500)] px-1 text-[9px] font-bold text-white tabular-nums ring-2 ring-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "max-w-full text-center text-xs font-medium leading-tight",
          active ? "text-[var(--brand-600)]" : "text-slate-900",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

function GroupCard({
  group,
  pathname,
  badges,
}: {
  group: NavGroup;
  pathname: string;
  badges: Record<string, number>;
}) {
  if (!group.items.length) return null;
  return (
    <section
      className="rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-sm"
      aria-label={group.label}
    >
      <h2 className="font-bold">{group.label}</h2>
      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-5">
        {group.items.map((item) => (
          <MenuTile
            key={item.href}
            item={item}
            pathname={pathname}
            count={badges[item.href] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

export function MobileMenuPage() {
  const pathname = usePathname();
  const router = useRouter();
  const vertical = useVertical();
  const verticalCopy = getVerticalCopy(vertical);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const settings = useLiveQuery(() => db.settings.get("store"));
  const badges = useNavBadges();
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
  const studioName = settings?.name ?? "Studio";
  const branchList =
    settings?.branches?.length
      ? settings.branches
      : [settings?.branchName || studioName].filter(Boolean);
  const branchName = settings?.branchName || branchList[0] || studioName;

  const setBranch = async (name: string) => {
    if (!settings || name === settings.branchName) return;
    await db.settings.put({ ...settings, branchName: name });
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-white p-4 shadow-sm dark:bg-slate-900">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-lg font-bold text-white"
              aria-hidden
            >
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold tracking-wide text-[var(--brand-700)] uppercase">
                Dolphin Rental
              </p>
              <p className="truncate text-xs text-slate-500">
                {verticalCopy.label}
                {" · "}
                {user.role === "owner" ? "Chủ studio" : "Nhân viên"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-[12px] border border-[var(--border)] bg-white p-3 shadow-sm">
          <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
            Chi nhánh
          </p>
          <div className="relative">
            <select
              aria-label="Chọn chi nhánh"
              className="w-full appearance-none rounded-[10px] border border-[var(--border)] bg-white py-2.5 pr-9 pl-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--brand-500)]"
              value={branchName}
              onChange={(e) => void setBranch(e.target.value)}
            >
              {branchList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

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
              <GroupCard
                key={group.id}
                group={group}
                pathname={pathname}
                badges={badges}
              />
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
                      count={badges[item.href] ?? 0}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex items-center justify-center gap-2 rounded-[12px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
