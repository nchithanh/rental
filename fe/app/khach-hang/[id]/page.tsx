"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderStatusTone } from "@/lib/labels";
import { cn, formatVnd } from "@/lib/utils";
import { notify } from "@/lib/notify";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customer = useLiveQuery(() => db.customers.get(id), [id]);
  const orders = useLiveQuery(async () => {
    const all = await db.orders.toArray();
    return all
      .filter((o) => o.customerId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [id]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setNote(customer.note ?? "");
  }, [customer]);

  if (!customer) {
    return (
      <AppShell>
        <p className="text-slate-500">Không tìm thấy khách.</p>
      </AppShell>
    );
  }

  const save = async () => {
    await db.customers.update(id, {
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim() || undefined,
    });
    notify.success("Đã lưu khách hàng");
  };

  const zalo = phone.replace(/\D/g, "");
  const totalSpend =
    orders
      ?.filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.paidRent + o.feesTotal, 0) ?? 0;

  return (
    <AppShell>
      <Link
        href="/khach-hang"
        className="mb-3 inline-block text-sm font-semibold text-[var(--brand-600)]"
      >
        ← Khách hàng
      </Link>

      <Card className="mb-4 space-y-2 p-4">
        <h1 className="text-xl font-bold">{customer.name}</h1>
        <p className="text-sm text-slate-500">
          {(orders?.length ?? 0) >= 2
            ? `Khách quay lại · ${orders?.length} đơn`
            : `${orders?.length ?? 0} đơn`}{" "}
          · đã chi {formatVnd(totalSpend)}
        </p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú"
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => void save()}>
            Lưu
          </Button>
          {zalo ? (
            <a
              href={`https://zalo.me/${zalo}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold"
            >
              Zalo
            </a>
          ) : null}
        </div>
      </Card>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-bold">Lịch sử thuê</h2>
        <Link
          href={`/don-thue/moi`}
          className="text-sm font-semibold text-[var(--brand-600)]"
        >
          + Đơn mới
        </Link>
      </div>
      <div className="space-y-2">
        {(orders ?? []).map((o) => (
          <Link key={o.id} href={`/don-thue/${o.id}`}>
            <Card className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold">{o.code}</p>
                <p className="text-xs text-slate-500">
                  {o.startDate} → {o.endDate} · {formatVnd(o.rentTotal)}
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
    </AppShell>
  );
}
