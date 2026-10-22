"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { todayKey } from "@/lib/utils";

export default function CarePage() {
  const orders = useLiveQuery(() => db.orders.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const settings = useLiveQuery(() => db.settings.get("store"));
  const today = todayKey();
  const [zaloOn, setZaloOn] = useState(false);

  useEffect(() => {
    setZaloOn(!!settings?.zaloNotifyEnabled);
  }, [settings?.zaloNotifyEnabled]);

  const cMap = useMemo(() => {
    const m = new Map<string, { name: string; phone: string }>();
    for (const c of customers ?? [])
      m.set(c.id, { name: c.name, phone: c.phone });
    return m;
  }, [customers]);

  const reminders = useMemo(() => {
    return (orders ?? [])
      .filter(
        (o) =>
          o.status !== "returned" &&
          o.status !== "cancelled" &&
          (o.startDate === today || o.endDate === today || o.endDate < today),
      )
      .map((o) => {
        const kind =
          o.endDate < today
            ? "Quá hạn trả"
            : o.endDate === today
              ? "Trả hôm nay"
              : "Nhận hôm nay";
        return { order: o, kind };
      });
  }, [orders, today]);

  const toggleZalo = async () => {
    if (!settings) return;
    const next = !settings.zaloNotifyEnabled;
    await db.settings.put({ ...settings, zaloNotifyEnabled: next });
    setZaloOn(next);
    notify.success(
      next
        ? "Đã bật nhắc Zalo (mở zalo.me — chưa có OA API)"
        : "Đã tắt nhắc Zalo",
    );
  };

  return (
    <AppShell>
      <h1 className="mb-1 text-lg font-bold">Chăm sóc khách</h1>
      <p className="mb-4 text-sm text-slate-500">
        Nhắc nhận/trả · Zalo deep-link · website trưng bày
      </p>

      <Card className="mb-4 space-y-2 p-4">
        <p className="font-bold">Nhắc lịch hôm nay</p>
        {reminders.length === 0 ? (
          <p className="text-sm text-slate-500">Không có lịch cần nhắc.</p>
        ) : (
          reminders.map(({ order, kind }) => {
            const c = cMap.get(order.customerId);
            const zalo = (c?.phone ?? "").replace(/\D/g, "");
            return (
              <div
                key={order.id}
                className="rounded-[10px] border border-[var(--border)] p-3"
              >
                <p className="text-xs font-bold text-[var(--brand-600)]">
                  {kind}
                </p>
                <p className="font-semibold">
                  {order.code} · {c?.name}
                </p>
                <p className="text-xs text-slate-500">{c?.phone}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`/don-thue/${order.id}`}
                    className="text-xs font-bold text-[var(--brand-600)]"
                  >
                    Xem đơn
                  </Link>
                  {kind.includes("Trả") || kind.includes("Quá hạn") ? (
                    <Link
                      href={`/tra-do?order=${order.id}`}
                      className="text-xs font-bold text-[var(--brand-600)]"
                    >
                      Trả đồ
                    </Link>
                  ) : null}
                  {zalo && zaloOn ? (
                    <a
                      href={`https://zalo.me/${zalo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-700"
                    >
                      Nhắn Zalo
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </Card>

      <Card className="mb-3 space-y-2 p-4">
        <p className="font-bold">Zalo thông báo</p>
        <p className="text-sm text-slate-500">
          Demo: mở chat Zalo theo SĐT khách. Tích hợp Zalo OA / tin tự động =
          TODO.
        </p>
        <Button variant="outline" onClick={() => void toggleZalo()}>
          {zaloOn ? "Đang bật deep-link — tắt" : "Bật hiện nút Zalo trên nhắc"}
        </Button>
      </Card>

      <Card className="space-y-2 p-4">
        <p className="font-bold">Website trưng bày</p>
        <p className="text-sm text-slate-500">
          Trang public xem mẫu + gửi yêu cầu đặt lịch (lưu local, chưa gửi
          server).
        </p>
        <Link
          href="/showcase"
          className="inline-flex text-sm font-bold text-[var(--brand-600)]"
        >
          Mở /showcase →
        </Link>
      </Card>
    </AppShell>
  );
}
