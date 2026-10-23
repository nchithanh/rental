"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Command } from "cmdk";
import {
  ClipboardPlus,
  PackageCheck,
  Search,
  Shirt,
  Sparkles,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { getNavGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical";
import { useAuthStore } from "@/stores/auth-store";

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const vertical = useVertical();
  const user = useAuthStore((s) => s.user);
  const garments = useLiveQuery(() => db.garments.toArray()) ?? [];
  const customers = useLiveQuery(() => db.customers.toArray()) ?? [];
  const orders = useLiveQuery(() => db.orders.toArray()) ?? [];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /** Mobile: không auto bàn phím — blur nếu cmdk tự focus khi mở */
  useEffect(() => {
    if (!open || !isMobile) return;
    const blur = () => {
      const el = document.activeElement as HTMLElement | null;
      if (
        el?.getAttribute("cmdk-input") != null ||
        el?.closest?.("[cmdk-input]")
      ) {
        el.blur();
      }
    };
    blur();
    const t = window.setTimeout(blur, 50);
    return () => window.clearTimeout(t);
  }, [open, isMobile]);

  const canCatalog =
    !user || user.permissions["trang-phuc"] !== false;
  const canOrders = !user || user.permissions["don-thue"] !== false;
  const canCustomers =
    !user || user.permissions["khach-hang"] !== false;
  const canPay = !user || user.permissions["thanh-toan"] !== false;

  const items = useMemo(() => {
    const list: PaletteItem[] = [];
    const navItems = getNavGroups(vertical).flatMap((g) => g.items);

    for (const n of navItems) {
      if (n.permission && user && !user.permissions[n.permission]) continue;
      list.push({
        id: `nav-${n.href}`,
        group: "Trang",
        label: n.label,
        href: n.href,
        icon: n.icon,
        keywords: n.label,
      });
    }

    const quick: { href: string; label: string; icon: LucideIcon }[] = [];
    if (canOrders) {
      quick.push({
        href: "/don-thue/moi",
        label: "Tạo đơn thuê",
        icon: ClipboardPlus,
      });
      quick.push({
        href: "/tra-do",
        label: "Trả đồ / nhận lại",
        icon: PackageCheck,
      });
    }
    if (canPay) {
      quick.push({
        href: "/thanh-toan",
        label: "Thu tiền & cọc",
        icon: Wallet,
      });
    }
    for (const q of quick) {
      list.push({
        id: `act-${q.href}`,
        group: "Thao tác nhanh",
        label: q.label,
        href: q.href,
        icon: q.icon,
        keywords: q.label,
      });
    }

    if (canCatalog) {
      for (const g of garments.slice(0, 200)) {
        if (!g.active) continue;
        list.push({
          id: `g-${g.id}`,
          group: "Kho thuê",
          label: g.name,
          hint: `${g.code} · ${g.status} · ${g.category}`,
          href: `/trang-phuc/${g.id}`,
          icon: Shirt,
          keywords: `${g.name} ${g.code} ${g.category} ${g.color} ${g.size}`,
        });
      }
    }

    if (canCustomers) {
      for (const c of customers.slice(0, 80)) {
        list.push({
          id: `c-${c.id}`,
          group: "Khách hàng",
          label: c.name,
          hint: c.phone,
          href: `/khach-hang/${c.id}`,
          icon: UsersRound,
          keywords: `${c.name} ${c.phone}`,
        });
      }
    }

    if (canOrders) {
      for (const o of orders.slice(0, 80)) {
        list.push({
          id: `o-${o.id}`,
          group: "Đơn thuê",
          label: o.code,
          hint: `${o.status} · ${o.startDate} → ${o.endDate}`,
          href: `/don-thue/${o.id}`,
          icon: ClipboardPlus,
          keywords: `${o.code} ${o.status}`,
        });
      }
    }

    return list;
  }, [
    vertical,
    user,
    garments,
    customers,
    orders,
    canCatalog,
    canOrders,
    canCustomers,
    canPay,
  ]);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of items) {
      const cur = map.get(item.group) ?? [];
      cur.push(item);
      map.set(item.group, cur);
    }
    return [...map.entries()];
  }, [items]);

  const go = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="command-palette"
          className={cn(
            "pos-cmd-backdrop fixed inset-0 z-[90] flex items-center justify-center p-4",
            "lg:items-end lg:justify-end lg:p-5 lg:pb-24",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0"
            aria-label="Đóng"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={cn(
              "pos-cmd-neon relative z-10 w-full max-w-md",
              "max-h-[min(85vh,36rem)]",
            )}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Command
              className="pos-cmd-panel flex max-h-[min(85vh,36rem)] w-full flex-col"
              label="Search AI"
            >
              <div className="pos-cmd-header flex items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-700">
                <span
                  className="relative inline-flex shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <Search
                    size={18}
                    className="pos-cmd-search-glow text-[var(--brand-600)]"
                  />
                  <Sparkles
                    size={9}
                    className="absolute -top-1 -right-1 text-[var(--brand-500)]"
                  />
                </span>
                <Command.Input
                  autoFocus={!isMobile}
                  placeholder="Hỏi Dolphin hoặc tìm kiếm…"
                  className="min-w-0 flex-1 py-3.5 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                  onClick={() => onOpenChange(false)}
                  aria-label="Đóng"
                >
                  <X size={16} />
                </button>
                <kbd className="hidden rounded-[8px] border border-slate-200 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-400 lg:inline dark:border-slate-600">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-[min(58vh,26rem)] overflow-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-sm text-slate-500">
                  Không có kết quả
                </Command.Empty>
                {groups.map(([group, rows]) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase"
                  >
                    {rows.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={`${item.label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.group}`}
                        onSelect={() => go(item.href)}
                        className="group relative flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-slate-800 aria-selected:bg-[var(--brand-50)] aria-selected:text-[var(--brand-700)] dark:text-slate-100 dark:aria-selected:bg-[var(--brand-950)] dark:aria-selected:text-[var(--brand-300)]"
                      >
                        <span
                          className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-transparent group-aria-selected:bg-[var(--brand-500)]"
                          aria-hidden
                        />
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--brand-50)] text-[var(--brand-600)] dark:bg-[var(--brand-950)] dark:text-[var(--brand-300)]">
                          <item.icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{item.label}</span>
                          {item.hint ? (
                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="border-t border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="text-center text-[0.7rem] text-slate-400">
                  ↑↓ di chuyển · Enter chọn · Esc đóng
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[0.65rem] text-[var(--brand-600)]">
                  <Sparkles size={10} aria-hidden />
                  Được hỗ trợ bởi Dolphin AI
                </p>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
