"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LayoutGrid, LogOut, Share2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { PageTransition } from "@/components/layout/page-transition";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getNavGroups, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function showcaseUrl() {
  if (typeof window === "undefined") return `${basePath}/showcase`;
  return `${window.location.origin}${basePath}/showcase`;
}

async function shareShowcase() {
  const url = showcaseUrl();
  const title = "Website trưng bày — Studio Thuê";
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, url, text: title });
      return;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(url);
    notify.success("Đã copy link trưng bày");
  } catch {
    notify.info(url);
  }
}

function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = normalizePath(pathname);
  const router = useRouter();
  const vertical = useVertical();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const settings = useLiveQuery(() => db.settings.get("store"));

  const groups = useMemo(() => {
    return getNavGroups(vertical)
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            !user || !item.permission || user.permissions[item.permission],
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [user, vertical]);

  const nav = groups.flatMap((g) => g.items);
  const mobileDock = useMemo(() => {
    const primary = nav.filter((n) => n.mobilePrimary);
    return {
      home: primary.find((n) => n.href === "/"),
      garments: primary.find((n) => n.href === "/trang-phuc"),
      orders: primary.find((n) => n.href === "/don-thue"),
      pay: primary.find((n) => n.href === "/thanh-toan"),
    };
  }, [nav]);
  const menuActive = path === "/menu";
  const ordersActive = isNavActive("/don-thue", path);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4">
          <BrandMark className="h-9 w-9" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {settings?.name ?? "Studio Thuê"}
            </p>
            <p className="truncate text-[11px] text-slate-400">Dolphin Rental</p>
          </div>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="mb-1 px-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(item.href, path);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm font-medium",
                          active
                            ? "bg-[var(--brand-50)] text-[var(--brand-600)]"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-50)] text-sm font-bold text-[var(--brand-600)]">
              {(user?.name ?? "N").trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header
          data-pos-shell-header
          className="z-30 flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--card)]/95 px-3 py-3 backdrop-blur sm:px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <BrandMark className="h-8 w-8 shrink-0 lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {settings?.name ?? "Studio Thuê"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {user?.name ?? "—"}
                {user?.role === "owner"
                  ? " · Chủ studio"
                  : user
                    ? " · Nhân viên"
                    : ""}
                <span className="hidden sm:inline">
                  {" · "}
                  {settings?.slogan ?? "Cho thuê trang phục"}
                </span>
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0 gap-1 rounded-full px-3"
            onClick={() => void shareShowcase()}
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Chia sẻ trưng bày</span>
            <span className="sm:hidden">Chia sẻ</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            aria-label="Đăng xuất"
          >
            <LogOut size={18} />
          </Button>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-36 sm:px-5 lg:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <nav
        id="mobile-bottom-nav"
        aria-label="Điều hướng"
        className="pointer-events-none fixed inset-x-3 z-40 bottom-[max(1.35rem,calc(env(safe-area-inset-bottom)+0.6rem))] lg:hidden"
      >
        <div className="pointer-events-auto relative mx-auto max-w-lg pt-9">
          {mobileDock.orders ? (
            <Link
              href={mobileDock.orders.href}
              aria-label={mobileDock.orders.label}
              className={cn(
                "absolute top-0 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(93,92,196,0.42)]",
                ordersActive ? "bg-[var(--brand-600)]" : "bg-[var(--brand-500)]",
              )}
            >
              <ClipboardList size={22} strokeWidth={2} className="text-white" />
            </Link>
          ) : null}

          <div className="relative drop-shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
            <div
              className={cn(
                "pos-mobile-dock-pill relative flex h-[3.85rem] items-end rounded-full border border-[var(--border)] bg-[var(--card)] px-1.5 pb-1 backdrop-blur-md",
                mobileDock.orders && "pos-mobile-dock-pill--notch",
              )}
            >
              <div className="grid h-full w-full grid-cols-5 items-stretch gap-0">
                {(["home", "garments"] as const).map((slot) => {
                  const item = mobileDock[slot];
                  if (!item) return <div key={slot} />;
                  const active = isNavActive(item.href, path);
                  const Icon = item.icon;
                  const isHome = item.href === "/";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active ? "text-emerald-600" : "text-slate-400",
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isHome ? (
                          <BrandMark className="h-5 w-5" />
                        ) : (
                          <Icon size={20} strokeWidth={2} />
                        )}
                      </span>
                      <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })}

                <div className="flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1">
                  <span className="h-5 w-5 shrink-0" aria-hidden />
                  <span
                    className={cn(
                      "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                      ordersActive ? "text-emerald-600" : "text-slate-400",
                    )}
                  >
                    {mobileDock.orders?.mobileLabel ??
                      mobileDock.orders?.label ??
                      "Đơn thuê"}
                  </span>
                </div>

                {(() => {
                  const item = mobileDock.pay;
                  if (!item) return <div />;
                  const Icon = item.icon;
                  const active = isNavActive(item.href, path);
                  return (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active ? "text-emerald-600" : "text-slate-400",
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })()}

                <Link
                  href="/menu"
                  className={cn(
                    "flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                    menuActive ? "text-emerald-600" : "text-slate-400",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <LayoutGrid size={20} strokeWidth={2} />
                  </span>
                  <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                    Menu
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
