"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderStatusTone } from "@/lib/labels";
import { orderBalance } from "@/lib/rental";
import { cn, formatVnd, todayKey } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const FILTERS: (OrderStatus | "all" | "overdue")[] = [
  "all",
  "scheduled",
  "confirmed",
  "renting",
  "returned",
  "cancelled",
  "overdue",
];

export default function OrdersPage() {
  const orders = useLiveQuery(() =>
    db.orders.orderBy("createdAt").reverse().toArray(),
  );
  const customers = useLiveQuery(() => db.customers.toArray());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const today = todayKey();

  const cusMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customers ?? []) m.set(c.id, c.name);
    return m;
  }, [customers]);

  const all = orders ?? [];

  const overview = useMemo(() => {
    let renting = 0;
    let overdue = 0;
    let todayStart = 0;
    let open = 0;
    for (const o of all) {
      if (o.status === "cancelled") continue;
      if (o.status !== "returned") open += 1;
      if (o.status === "renting") renting += 1;
      if (orderBalance(o).overdue) overdue += 1;
      if (o.startDate === today) todayStart += 1;
    }
    return {
      total: all.length,
      open,
      renting,
      overdue,
      todayStart,
    };
  }, [all, today]);

  const filtered = useMemo(() => {
    return all.filter((o) => {
      if (filter === "all") return true;
      if (filter === "overdue") return orderBalance(o).overdue;
      return o.status === filter;
    });
  }, [all, filter]);

  const kpis = [
    {
      label: "Tổng đơn",
      value: String(overview.total),
      icon: ClipboardList,
      tone: "bg-[var(--brand-50)] text-[var(--brand-600)]",
    },
    {
      label: "Đang mở",
      value: String(overview.open),
      icon: Package,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Đang thuê",
      value: String(overview.renting),
      icon: CalendarDays,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Quá hạn",
      value: String(overview.overdue),
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Đơn thuê"
        description={`Khách · ngày nhận/trả · cọc · tổng${
          overview.todayStart > 0
            ? ` · ${overview.todayStart} nhận hôm nay`
            : ""
        }`}
        actions={
          <Link href="/don-thue/moi">
            <Button size="sm" variant="default">
              + Tạo đơn
            </Button>
          </Link>
        }
      />

      <section
        aria-label="Tổng quan đơn thuê"
        className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
      >
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="studio-kpi p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-500">{k.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
                    {k.value}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]",
                    k.tone,
                  )}
                >
                  <Icon size={15} />
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === f
                ? "bg-[var(--brand-500)] text-white"
                : "border border-[var(--border)] bg-white text-slate-900",
            )}
          >
            {f === "all"
              ? "Tất cả"
              : f === "overdue"
                ? "Quá hạn"
                : ORDER_STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-6 gap-3 border-b border-[var(--border)] bg-[var(--banner)]/60 px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:grid">
          <span>Mã đơn</span>
          <span>Khách</span>
          <span>Ngày thuê</span>
          <span>Tổng</span>
          <span>Cọc giữ</span>
          <span>Trạng thái</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Không có đơn phù hợp.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((o) => {
              const bal = orderBalance(o);
              return (
                <li key={o.id}>
                  <Link
                    href={`/don-thue/${o.id}`}
                    className="grid grid-cols-1 gap-1 px-4 py-3 text-left transition hover:bg-[var(--brand-50)]/50 sm:grid-cols-6 sm:items-center sm:gap-3"
                  >
                    <div className="flex items-start justify-between gap-2 sm:block">
                      <span className="block truncate font-semibold text-slate-900">
                        {o.code}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:hidden",
                          bal.overdue
                            ? "bg-rose-50 text-rose-600"
                            : orderStatusTone(o.status),
                        )}
                      >
                        {bal.overdue
                          ? "Quá hạn"
                          : ORDER_STATUS_LABEL[o.status]}
                      </span>
                    </div>
                    <span className="block truncate text-sm text-slate-600">
                      {cusMap.get(o.customerId) ?? "Khách"}
                      <span className="text-slate-400 sm:hidden">
                        {" "}
                        · {o.lines.length} món
                      </span>
                    </span>
                    <span className="block truncate text-xs text-slate-500 sm:text-sm">
                      {o.startDate} → {o.endDate}
                    </span>
                    <span className="block truncate text-sm font-semibold tabular-nums">
                      {formatVnd(o.rentTotal)}
                    </span>
                    <span className="hidden truncate text-sm text-slate-500 tabular-nums sm:block">
                      {formatVnd(bal.depositHeld)}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-block sm:w-fit",
                        bal.overdue
                          ? "bg-rose-50 text-rose-600"
                          : orderStatusTone(o.status),
                      )}
                    >
                      {bal.overdue ? "Quá hạn" : ORDER_STATUS_LABEL[o.status]}
                    </span>
                    <span className="text-xs text-slate-500 sm:hidden">
                      Cọc giữ {formatVnd(bal.depositHeld)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
