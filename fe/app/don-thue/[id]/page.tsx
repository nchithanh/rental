"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, GARMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from "@/lib/db";
import {
  PAYMENT_KIND_LABEL,
  PAYMENT_METHOD_LABEL,
  garmentStatusTone,
  orderStatusTone,
} from "@/lib/labels";
import {
  orderBalance,
  recordPayment,
  setOrderStatus,
  updateOrderDates,
} from "@/lib/rental";
import { cn, formatDateTime, formatVnd, vndAmountSuggestions } from "@/lib/utils";
import { notify } from "@/lib/notify";
import type { OrderStatus, PaymentKind, PaymentMethod } from "@/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = useLiveQuery(() => db.orders.get(id), [id]);
  const customer = useLiveQuery(
    () => (order ? db.customers.get(order.customerId) : undefined),
    [order?.customerId],
  );
  const garments = useLiveQuery(() => db.garments.toArray());
  const payments = useLiveQuery(
    () => db.payments.where("orderId").equals(id).sortBy("createdAt"),
    [id],
  );

  const gMap = useMemo(() => {
    const m = new Map<string, NonNullable<typeof garments>[number]>();
    for (const g of garments ?? []) m.set(g.id, g);
    return m;
  }, [garments]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payKind, setPayKind] = useState<PaymentKind>("rent");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");

  useEffect(() => {
    if (!order) return;
    setStartDate(order.startDate);
    setEndDate(order.endDate);
  }, [order]);

  if (!order) {
    return (
      <AppShell>
        <p className="text-slate-500">Không tìm thấy đơn.</p>
      </AppShell>
    );
  }

  const bal = orderBalance(order);
  const closed = order.status === "returned" || order.status === "cancelled";
  const amountHints = vndAmountSuggestions(payAmount);

  const changeStatus = async (status: OrderStatus) => {
    try {
      await setOrderStatus(id, status);
      notify.success("Đã cập nhật trạng thái đơn");
    } catch (e) {
      notify.fromError(e);
    }
  };

  const saveDates = async () => {
    try {
      await updateOrderDates(id, startDate, endDate);
      notify.success("Đã cập nhật lịch thuê");
    } catch (e) {
      notify.fromError(e);
    }
  };

  const onPay = async () => {
    try {
      await recordPayment({
        orderId: id,
        kind: payKind,
        amount: Number(payAmount) || 0,
        method: payMethod,
      });
      notify.success("Đã ghi nhận thanh toán");
      setPayAmount("");
    } catch (e) {
      notify.fromError(e);
    }
  };

  const quickPay = async (kind: PaymentKind, amount: number) => {
    if (amount <= 0) {
      notify.info("Không còn số tiền cần thu");
      return;
    }
    try {
      await recordPayment({
        orderId: id,
        kind,
        amount,
        method: payMethod,
      });
      notify.success(`Đã thu ${PAYMENT_KIND_LABEL[kind]}`);
    } catch (e) {
      notify.fromError(e);
    }
  };

  return (
    <AppShell>
      <Link
        href="/don-thue"
        className="mb-3 inline-block text-sm font-semibold text-[var(--brand-600)]"
      >
        ← Đơn thuê
      </Link>

      <Card className="mb-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{order.code}</h1>
            <Link
              href={`/khach-hang/${order.customerId}`}
              className="text-sm font-semibold text-[var(--brand-600)]"
            >
              {customer?.name} · {customer?.phone}
            </Link>
            {order.note ? (
              <p className="mt-1 text-xs text-slate-500">{order.note}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-bold",
              bal.overdue ? "bg-rose-50 text-rose-600" : orderStatusTone(order.status),
            )}
          >
            {bal.overdue ? "Quá hạn" : ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <p>Thuê: {formatVnd(order.rentTotal)}</p>
          <p>Cọc: {formatVnd(order.depositTotal)}</p>
          <p>Đã thu thuê: {formatVnd(order.paidRent)}</p>
          <p className="font-semibold text-rose-600">
            Còn thu: {formatVnd(bal.dueRent)}
          </p>
          <p>Cọc giữ: {formatVnd(bal.depositHeld)}</p>
          <p>Phí PS: {formatVnd(order.feesTotal)}</p>
        </div>
      </Card>

      {!closed ? (
        <Card className="mb-4 space-y-2 p-4">
          <h2 className="font-bold">Ngày nhận / trả</h2>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full" onClick={() => void saveDates()}>
            Lưu lịch (kiểm tra trùng)
          </Button>
        </Card>
      ) : null}

      <h2 className="mb-2 font-bold">
        Trang phục trong đơn ({order.lines.length})
      </h2>
      <div className="mb-4 space-y-2">
        {order.lines.map((l) => {
          const g = gMap.get(l.garmentId);
          return (
            <Card key={l.garmentId} className="flex items-center gap-3 p-3">
              <span className="text-2xl">{g?.emoji ?? "👗"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {g?.code} · {g?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {g ? (
                    <span
                      className={cn(
                        "mr-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        garmentStatusTone(g.status),
                      )}
                    >
                      {GARMENT_STATUS_LABEL[g.status]}
                    </span>
                  ) : (
                    "—"
                  )}
                  thuê {formatVnd(l.rentPrice)} · cọc {formatVnd(l.deposit)}
                </p>
              </div>
              {g ? (
                <Link
                  href={`/trang-phuc/${g.id}`}
                  className="text-xs font-bold text-[var(--brand-600)]"
                >
                  Chi tiết
                </Link>
              ) : null}
            </Card>
          );
        })}
      </div>

      {!closed ? (
        <Card className="mb-4 space-y-2 p-4">
          <h2 className="font-bold">Cập nhật trạng thái</h2>
          <div className="flex flex-wrap gap-2">
            {(["scheduled", "confirmed", "renting", "cancelled"] as OrderStatus[])
              .filter((s) => s !== order.status)
              .map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  onClick={() => void changeStatus(s)}
                >
                  {ORDER_STATUS_LABEL[s]}
                </Button>
              ))}
            <Link href={`/tra-do?order=${id}`}>
              <Button size="sm">Trả đồ chi tiết →</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      <Card className="mb-4 space-y-2 p-4">
        <h2 className="font-bold">Thanh toán</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              void quickPay(
                "rent",
                Math.max(0, order.rentTotal + order.feesTotal - order.paidRent),
              )
            }
          >
            Thu hết tiền thuê
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              void quickPay(
                "deposit",
                Math.max(0, order.depositTotal - order.paidDeposit),
              )
            }
          >
            Thu đủ cọc
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-[10px] border px-2 py-2 text-sm"
            value={payKind}
            onChange={(e) => setPayKind(e.target.value as PaymentKind)}
          >
            {Object.entries(PAYMENT_KIND_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            className="rounded-[10px] border px-2 py-2 text-sm"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
          >
            {Object.entries(PAYMENT_METHOD_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Số tiền"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          {amountHints.length > 0 ? (
            <div
              className="mt-2 flex flex-wrap gap-1.5"
              role="list"
              aria-label="Gợi ý số tiền"
            >
              {amountHints.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="listitem"
                  onClick={() => setPayAmount(String(v))}
                  className="rounded-full border border-[var(--brand-500)]/30 bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-600)]"
                >
                  {formatVnd(v)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button className="w-full" onClick={() => void onPay()}>
          Lưu thanh toán
        </Button>
      </Card>

      <h2 className="mb-2 font-bold">Lịch sử thanh toán</h2>
      <div className="space-y-2">
        {[...(payments ?? [])].reverse().map((p) => (
          <Card key={p.id} className="flex justify-between p-3 text-sm">
            <div>
              <p className="font-semibold">{PAYMENT_KIND_LABEL[p.kind]}</p>
              <p className="text-xs text-slate-400">
                {formatDateTime(p.createdAt)} ·{" "}
                {PAYMENT_METHOD_LABEL[p.method]}
                {p.note ? ` · ${p.note}` : ""}
              </p>
            </div>
            <p className="font-bold">{formatVnd(p.amount)}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
