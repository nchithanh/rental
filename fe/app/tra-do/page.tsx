"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, ORDER_STATUS_LABEL } from "@/lib/db";
import { completeReturn, orderBalance } from "@/lib/rental";
import { formatVnd } from "@/lib/utils";
import { notify } from "@/lib/notify";

type Cond = "ok" | "laundry" | "repair" | "damage" | "lost";

function ReturnInner() {
  const search = useSearchParams();
  const qOrder = search.get("order") ?? "";
  const orders = useLiveQuery(() => db.orders.toArray());
  const garments = useLiveQuery(() => db.garments.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const openOrders = useMemo(
    () =>
      (orders ?? []).filter(
        (o) =>
          o.status === "renting" ||
          o.status === "confirmed" ||
          orderBalance(o).overdue,
      ),
    [orders],
  );

  const [orderId, setOrderId] = useState(qOrder);
  const [conds, setConds] = useState<Record<string, Cond>>({});
  const [fees, setFees] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (qOrder) setOrderId(qOrder);
  }, [qOrder]);

  const active =
    openOrders.find((o) => o.id === orderId) ?? openOrders[0] ?? null;

  const gMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of garments ?? []) m.set(g.id, `${g.code} · ${g.name}`);
    return m;
  }, [garments]);

  const cMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customers ?? []) m.set(c.id, c.name);
    return m;
  }, [customers]);

  const onSubmit = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const items = active.lines.map((l) => ({
        garmentId: l.garmentId,
        condition: conds[l.garmentId] ?? "ok",
        fee: Number(fees[l.garmentId] || 0) || undefined,
        note: notes[l.garmentId]?.trim() || undefined,
      }));
      const feeTotal = items.reduce((s, i) => s + (i.fee ?? 0), 0);
      const held = orderBalance(active).depositHeld;
      const refund = Math.max(0, held - feeTotal);
      await completeReturn({
        orderId: active.id,
        items,
        refundDeposit: refund,
        method: "cash",
      });
      notify.success(
        `Đã nhận lại đồ · hoàn cọc ${formatVnd(refund)}${
          feeTotal ? ` · phí ${formatVnd(feeTotal)}` : ""
        }`,
      );
      setConds({});
      setFees({});
      setNotes({});
    } catch (e) {
      notify.fromError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="mb-1 text-lg font-bold">Trả đồ</h1>
      <p className="mb-4 text-sm text-slate-500">
        Kiểm tra tình trạng · ghi chú · phí · cập nhật sẵn sàng / giặt / sửa
      </p>

      {openOrders.length === 0 ? (
        <Card className="p-4 text-sm text-slate-500">
          Không có đơn đang thuê / quá hạn.{" "}
          <Link href="/don-thue" className="font-semibold text-[var(--brand-600)]">
            Xem đơn
          </Link>
        </Card>
      ) : (
        <>
          <label className="mb-3 block text-sm">
            <span className="mb-1 block font-medium text-slate-500">Chọn đơn</span>
            <select
              className="w-full rounded-[10px] border px-3 py-2"
              value={active?.id ?? ""}
              onChange={(e) => setOrderId(e.target.value)}
            >
              {openOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} · {cMap.get(o.customerId)} ·{" "}
                  {ORDER_STATUS_LABEL[o.status]}
                  {orderBalance(o).overdue ? " · QUÁ HẠN" : ""}
                </option>
              ))}
            </select>
          </label>

          {active ? (
            <div className="space-y-3">
              <Card className="p-3 text-sm">
                <Link
                  href={`/don-thue/${active.id}`}
                  className="font-bold text-[var(--brand-600)]"
                >
                  {active.code}
                </Link>
                <p className="text-slate-500">
                  Trả dự kiến {active.endDate} · Cọc giữ{" "}
                  {formatVnd(orderBalance(active).depositHeld)}
                </p>
              </Card>

              {active.lines.map((l) => (
                <Card key={l.garmentId} className="space-y-2 p-4">
                  <p className="font-semibold">
                    {gMap.get(l.garmentId) ?? l.garmentId}
                  </p>
                  <select
                    className="w-full rounded-[10px] border px-2 py-2 text-sm"
                    value={conds[l.garmentId] ?? "ok"}
                    onChange={(e) =>
                      setConds((c) => ({
                        ...c,
                        [l.garmentId]: e.target.value as Cond,
                      }))
                    }
                  >
                    <option value="ok">OK — sẵn sàng cho thuê lại</option>
                    <option value="laundry">Cần giặt</option>
                    <option value="repair">Cần sửa</option>
                    <option value="damage">Hư hỏng (+phí)</option>
                    <option value="lost">Thất lạc (+phí)</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Phí phát sinh (nếu có)"
                    value={fees[l.garmentId] ?? ""}
                    onChange={(e) =>
                      setFees((f) => ({ ...f, [l.garmentId]: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Ghi chú tình trạng món này"
                    value={notes[l.garmentId] ?? ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [l.garmentId]: e.target.value }))
                    }
                  />
                </Card>
              ))}

              <Card className="p-4 text-sm text-slate-500">
                Hoàn cọc = cọc giữ − tổng phí phát sinh trên các món.
              </Card>

              <Button
                className="w-full"
                disabled={busy}
                onClick={() => void onSubmit()}
              >
                {busy ? "Đang lưu…" : "Xác nhận nhận lại đồ"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

export default function ReturnPage() {
  return (
    <AppShell>
      <Suspense fallback={<p className="text-sm text-slate-500">Đang tải…</p>}>
        <ReturnInner />
      </Suspense>
    </AppShell>
  );
}
