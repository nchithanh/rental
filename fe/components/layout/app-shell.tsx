"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Share2,
  Sparkles,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/layout/command-palette";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { PageTransition } from "@/components/layout/page-transition";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getNavGroups, isNavActive } from "@/lib/nav";
import { useNavBadges } from "@/lib/nav-badges";
import { cn } from "@/lib/utils";
import { getVerticalCopy, useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function showcaseUrl() {
  if (typeof window === "undefined") return `${basePath}/showcase`;
  return `${window.location.origin}${basePath}/showcase`;
}

async function shareShowcase() {
  const url = showcaseUrl();
  const title = "Website trưng bày — Dolphin Studio Váy & Vest";
  const data: ShareData = { title, text: title, url };

  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    notify.info("Trình duyệt không hỗ trợ sheet chia sẻ");
    return;
  }
  if (
    typeof navigator.canShare === "function" &&
    !navigator.canShare(data)
  ) {
    notify.info("Trình duyệt không hỗ trợ chia sẻ link này");
    return;
  }

  try {
    await navigator.share(data);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    notify.fromError(e, "Không mở được sheet chia sẻ");
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
  const verticalCopy = getVerticalCopy(vertical);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const settings = useLiveQuery(() => db.settings.get("store"));
  const badges = useNavBadges();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  /** Mobile: scroll xuống ẩn dock + Search AI; scroll lên hiện lại */
  useEffect(() => {
    setNavHidden(false);
    const el = mainRef.current;
    if (!el) return;
    let last = el.scrollTop;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - last;
      last = y;
      if (y < 12) {
        setNavHidden(false);
        return;
      }
      if (delta > 8) setNavHidden(true);
      else if (delta < -8) setNavHidden(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [path]);

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
  const studioName = settings?.name ?? "Dolphin Studio Váy & Vest";
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
    <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 pt-5 pb-2">
          <BrandMark className="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-wide text-[var(--brand-700)] uppercase">
              Dolphin Rental
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {verticalCopy.label}
            </p>
          </div>
        </div>

        <div className="px-4 pb-3">
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

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(item.href, path);
                  const Icon = item.icon;
                  const count = badges[item.href] ?? 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-[var(--brand-50)] text-slate-900 before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[var(--brand-500)]"
                            : "text-slate-600 hover:bg-[var(--brand-50)]/70",
                        )}
                      >
                        <Icon size={18} className="shrink-0 text-slate-700" />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        {count > 0 ? (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-500)] px-1.5 text-[10px] font-bold text-white tabular-nums">
                            {count > 99 ? "99+" : count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-base font-bold text-white">
              {(user?.name ?? "N").trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">
                {user?.email ??
                  (user?.role === "owner" ? "Chủ studio" : "Nhân viên")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header
          data-pos-shell-header
          className="z-30 flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-white/90 px-3 py-3.5 backdrop-blur-md sm:px-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <BrandMark className="h-8 w-8 shrink-0 lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-slate-900 lg:text-lg">
                {studioName}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Xin chào, {user?.name ?? "—"}
                {user?.role === "owner"
                  ? " · Chủ studio"
                  : user
                    ? " · Nhân viên"
                    : ""}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="default"
            className="shrink-0 gap-1"
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

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-5 pb-36 sm:px-6 lg:pb-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile: dock + Search AI chung một khối → scroll ẩn/hiện cùng nhau */}
      <div
        className={cn(
          "pos-mobile-chrome fixed inset-x-0 z-40 lg:hidden",
          "bottom-[max(1.35rem,calc(env(safe-area-inset-bottom)+0.6rem))]",
          navHidden && "is-hidden",
        )}
      >
        {!paletteOpen ? (
          <button
            type="button"
            className="pos-cmd-fab pointer-events-auto absolute right-5 bottom-[calc(3.85rem+0.65rem)] z-50 inline-flex"
            aria-label="Search AI — tìm nhanh"
            title="Search AI — tìm nhanh (Ctrl+K)"
            onClick={() => setPaletteOpen(true)}
          >
            <Sparkles size={20} strokeWidth={2.25} aria-hidden />
          </button>
        ) : null}

        <nav
          id="mobile-bottom-nav"
          aria-label="Điều hướng"
          className="pointer-events-none relative px-3"
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

          <div className="relative drop-shadow-[0_8px_24px_rgba(26,35,50,0.1)]">
            <div
              className={cn(
                "pos-mobile-dock-pill relative flex h-[3.85rem] items-end rounded-full border border-[var(--border)] bg-white/95 px-1.5 pb-1 backdrop-blur-md",
                mobileDock.orders && "pos-mobile-dock-pill--notch",
              )}
            >
              <div className="grid h-full w-full grid-cols-5 items-stretch gap-0">
                {(["home", "garments"] as const).map((slot) => {
                  const item = mobileDock[slot];
                  if (!item) return <div key={slot} />;
                  const active = isNavActive(item.href, path);
                  const isHome = item.href === "/";
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "mx-0.5 flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active
                          ? "text-[var(--brand-600)]"
                          : "text-slate-500",
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isHome ? (
                          <BrandMark className="h-5 w-5" />
                        ) : (
                          <Icon
                            size={20}
                            strokeWidth={active ? 2.25 : 2}
                            className={
                              active ? "text-[var(--brand-600)]" : undefined
                            }
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                          active && "text-[var(--brand-600)]",
                        )}
                      >
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })}

                <div className="mx-0.5 flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1">
                  <span className="h-5 w-5 shrink-0" aria-hidden />
                  <span
                    className={cn(
                      "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                      ordersActive
                        ? "text-[var(--brand-600)]"
                        : "text-slate-500",
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
                        "mx-0.5 flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active
                          ? "text-[var(--brand-600)]"
                          : "text-slate-500",
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon
                          size={20}
                          strokeWidth={active ? 2.25 : 2}
                          className={
                            active ? "text-[var(--brand-600)]" : undefined
                          }
                        />
                      </span>
                      <span
                        className={cn(
                          "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                          active && "text-[var(--brand-600)]",
                        )}
                      >
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })()}

                <Link
                  href="/menu"
                  className={cn(
                    "mx-0.5 flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                    menuActive
                      ? "text-[var(--brand-600)]"
                      : "text-slate-500",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <LayoutGrid
                      size={20}
                      strokeWidth={menuActive ? 2.25 : 2}
                      className={
                        menuActive ? "text-[var(--brand-600)]" : undefined
                      }
                    />
                  </span>
                  <span
                    className={cn(
                      "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                      menuActive && "text-[var(--brand-600)]",
                    )}
                  >
                    Menu
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </nav>
      </div>

      {!paletteOpen ? (
        <button
          type="button"
          className="pos-cmd-fab fixed right-5 bottom-5 z-50 hidden lg:inline-flex"
          aria-label="Search AI — tìm nhanh"
          title="Search AI — tìm nhanh (Ctrl+K)"
          onClick={() => setPaletteOpen(true)}
        >
          <Sparkles size={20} strokeWidth={2.25} aria-hidden />
        </button>
      ) : null}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
