"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { db, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderStatusTone } from "@/lib/labels";
import { orderBalance } from "@/lib/rental";
import { cn, formatVnd, todayKey } from "@/lib/utils";

export default function ReportsPage() {
  const orders = useLiveQuery(() => db.orders.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const garments = useLiveQuery(() => db.garments.toArray());
  const today = todayKey();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [day, setDay] = useState(today);

  const stats = useMemo(() => {
    const dayRev =
      payments
        ?.filter(
          (p) =>
            p.createdAt.startsWith(day) &&
            (p.kind === "rent" || p.kind.startsWith("fee_")),
        )
        .reduce((s, p) => s + p.amount, 0) ?? 0;
    const monthRev =
      payments
        ?.filter(
          (p) =>
            p.createdAt.startsWith(month) &&
            (p.kind === "rent" || p.kind.startsWith("fee_")),
        )
        .reduce((s, p) => s + p.amount, 0) ?? 0;
    const open =
      orders?.filter(
        (o) => o.status !== "returned" && o.status !== "cancelled",
      ) ?? [];
    const overdue = open.filter((o) => orderBalance(o).overdue);
    const depositHeld =
      orders?.reduce((s, o) => s + orderBalance(o).depositHeld, 0) ?? 0;
    const due =
      orders?.reduce((s, o) => s + orderBalance(o).dueRent, 0) ?? 0;

    const rentCount = new Map<string, number>();
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      for (const l of o.lines) {
        rentCount.set(l.garmentId, (rentCount.get(l.garmentId) ?? 0) + 1);
      }
    }
    const top = [...rentCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      dayRev,
      monthRev,
      open,
      overdue,
      depositHeld,
      due,
      top,
    };
  }, [orders, payments, day, month]);

  const gMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of garments ?? []) m.set(g.id, `${g.code} · ${g.name}`);
    return m;
  }, [garments]);

  return (
    <AppShell>
      <PageHeader
        title="Báo cáo"
        description="Doanh thu ngày/tháng · đơn chưa trả · quá hạn · top đồ · công nợ/cọc"
      />

      <Card className="mb-4 grid grid-cols-2 gap-2 p-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-500">Ngày</span>
          <Input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-500">Tháng</span>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">DT ngày chọn</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
            {formatVnd(stats.dayRev)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">DT tháng chọn</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
            {formatVnd(stats.monthRev)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Đơn chưa trả</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
            {stats.open.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Đơn quá hạn</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-rose-600 sm:text-xl">
            {stats.overdue.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Công nợ còn thu</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
            {formatVnd(stats.due)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Cọc chưa hoàn</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">
            {formatVnd(stats.depositHeld)}
          </p>
        </Card>
      </div>

      <h2 className="mb-2 font-bold">Đơn quá hạn</h2>
      <div className="mb-4 space-y-2">
        {stats.overdue.length === 0 ? (
          <Card className="p-3 text-sm text-slate-500">Không có</Card>
        ) : (
          stats.overdue.map((o) => (
            <Link key={o.id} href={`/tra-do?order=${o.id}`}>
              <Card className="flex justify-between p-3">
                <div>
                  <p className="font-semibold">{o.code}</p>
                  <p className="text-xs text-rose-600">Trả dự kiến {o.endDate}</p>
                </div>
                <span className="text-xs font-bold text-[var(--brand-600)]">
                  Trả đồ →
                </span>
              </Card>
            </Link>
          ))
        )}
      </div>

      <h2 className="mb-2 font-bold">Đơn chưa trả</h2>
      <div className="mb-4 space-y-2">
        {stats.open.map((o) => (
          <Link key={o.id} href={`/don-thue/${o.id}`}>
            <Card className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold">{o.code}</p>
                <p className="text-xs text-slate-500">
                  {o.startDate} → {o.endDate}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-bold",
                  orderStatusTone(o.status),
                )}
              >
                {ORDER_STATUS_LABEL[o.status]}
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mb-2 font-bold">Trang phục thuê nhiều</h2>
      <div className="space-y-2">
        {stats.top.map(([gid, n]) => (
          <Link key={gid} href={`/trang-phuc/${gid}`}>
            <Card className="flex justify-between p-3">
              <span className="font-medium">{gMap.get(gid) ?? gid}</span>
              <span className="font-bold">{n} lần</span>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
