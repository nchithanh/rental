"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { PAYMENT_KIND_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/labels";
import { orderBalance } from "@/lib/rental";
import { cn, formatDateTime, formatVnd } from "@/lib/utils";
import type { PaymentKind } from "@/types";

const FILTERS: (PaymentKind | "all")[] = [
  "all",
  "rent",
  "deposit",
  "deposit_refund",
  "fee_late",
  "fee_damage",
  "fee_lost",
  "other",
];

export default function PaymentsPage() {
  const orders = useLiveQuery(() => db.orders.toArray());
  const payments = useLiveQuery(() =>
    db.payments.orderBy("createdAt").reverse().toArray(),
  );
  const [kind, setKind] = useState<(typeof FILTERS)[number]>("all");
  const [orderFilter, setOrderFilter] = useState("");

  const summary = useMemo(() => {
    let dueRent = 0;
    let depositHeld = 0;
    for (const o of orders ?? []) {
      const b = orderBalance(o);
      dueRent += b.dueRent;
      depositHeld += b.depositHeld;
    }
    const collected =
      payments
        ?.filter((p) => p.kind === "rent" || p.kind.startsWith("fee_"))
        .reduce((s, p) => s + p.amount, 0) ?? 0;
    return { dueRent, depositHeld, collected };
  }, [orders, payments]);

  const filtered = useMemo(() => {
    return (payments ?? []).filter((p) => {
      if (kind !== "all" && p.kind !== kind) return false;
      if (orderFilter && p.orderId !== orderFilter) return false;
      return true;
    });
  }, [payments, kind, orderFilter]);

  const orderCode = (id: string) =>
    orders?.find((o) => o.id === id)?.code ?? id;

  return (
    <AppShell>
      <h1 className="mb-1 text-lg font-bold">Thanh toán & cọc</h1>
      <p className="mb-4 text-sm text-slate-500">
        Thuê · cọc · phí · hoàn cọc · lịch sử theo đơn
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500">Còn phải thu (thuê+phí)</p>
          <p className="text-xl font-bold">{formatVnd(summary.dueRent)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Cọc đang giữ</p>
          <p className="text-xl font-bold text-[var(--brand-600)]">
            {formatVnd(summary.depositHeld)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Đã thu (thuê+phí)</p>
          <p className="text-xl font-bold">{formatVnd(summary.collected)}</p>
        </Card>
      </div>

      <h2 className="mb-2 font-bold">Đơn cần thu / còn cọc</h2>
      <div className="mb-4 space-y-2">
        {(orders ?? [])
          .filter((o) => {
            const b = orderBalance(o);
            return b.dueRent > 0 || b.depositHeld > 0;
          })
          .map((o) => {
            const b = orderBalance(o);
            return (
              <Card key={o.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{o.code}</p>
                    <p className="text-xs text-slate-500">
                      Còn thu {formatVnd(b.dueRent)} · Cọc giữ{" "}
                      {formatVnd(b.depositHeld)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <Link
                      href={`/don-thue/${o.id}`}
                      className="text-xs font-bold text-[var(--brand-600)]"
                    >
                      Thu trên đơn →
                    </Link>
                    <button
                      type="button"
                      className="text-[10px] text-slate-500 underline"
                      onClick={() =>
                        setOrderFilter((f) => (f === o.id ? "" : o.id))
                      }
                    >
                      {orderFilter === o.id ? "Bỏ lọc lịch sử" : "Lọc lịch sử"}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-bold">Lịch sử</h2>
        {orderFilter ? (
          <span className="text-xs text-slate-500">
            Đơn {orderCode(orderFilter)}
          </span>
        ) : null}
      </div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setKind(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              kind === f
                ? "bg-emerald-500 text-white"
                : "border bg-white text-slate-600",
            )}
          >
            {f === "all" ? "Tất cả" : PAYMENT_KIND_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 50).map((p) => (
          <Link key={p.id} href={`/don-thue/${p.orderId}`}>
            <Card className="flex justify-between p-3 text-sm">
              <div>
                <p className="font-semibold">{PAYMENT_KIND_LABEL[p.kind]}</p>
                <p className="text-xs text-slate-400">
                  {orderCode(p.orderId)} · {formatDateTime(p.createdAt)} ·{" "}
                  {PAYMENT_METHOD_LABEL[p.method]}
                </p>
              </div>
              <p className="font-bold">{formatVnd(p.amount)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
