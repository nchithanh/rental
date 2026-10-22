"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderStatusTone } from "@/lib/labels";
import { orderBalance } from "@/lib/rental";
import { cn, formatVnd } from "@/lib/utils";
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

  const cusMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customers ?? []) m.set(c.id, c.name);
    return m;
  }, [customers]);

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (filter === "all") return true;
      if (filter === "overdue") return orderBalance(o).overdue;
      return o.status === filter;
    });
  }, [orders, filter]);

  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Đơn thuê</h1>
          <p className="text-sm text-slate-500">
            Nhiều món · ngày nhận/trả · trạng thái
          </p>
        </div>
        <Link href="/don-thue/moi">
          <Button size="sm">+ Tạo đơn</Button>
        </Link>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === f
                ? "bg-emerald-500 text-white"
                : "border bg-white text-slate-600",
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

      <div className="space-y-2">
        {filtered.map((o) => {
          const bal = orderBalance(o);
          return (
            <Link key={o.id} href={`/don-thue/${o.id}`}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{o.code}</p>
                    <p className="text-sm text-slate-600">
                      {cusMap.get(o.customerId) ?? "Khách"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.startDate} → {o.endDate} · {o.lines.length} món
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-bold",
                      bal.overdue
                        ? "bg-rose-50 text-rose-600"
                        : orderStatusTone(o.status),
                    )}
                  >
                    {bal.overdue ? "Quá hạn" : ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Thuê {formatVnd(o.rentTotal)}</span>
                  <span className="text-slate-500">
                    Cọc giữ {formatVnd(bal.depositHeld)}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
