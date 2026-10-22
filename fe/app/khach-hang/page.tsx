"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { uid } from "@/lib/utils";

export default function CustomersPage() {
  const customers = useLiveQuery(() => db.customers.orderBy("name").toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const stats = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      m.set(o.customerId, (m.get(o.customerId) ?? 0) + 1);
    }
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (customers ?? [])
      .filter((c) => {
        if (!query) return true;
        return (
          c.name.toLowerCase().includes(query) || c.phone.includes(query)
        );
      })
      .sort((a, b) => (stats.get(b.id) ?? 0) - (stats.get(a.id) ?? 0));
  }, [customers, q, stats]);

  const onAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      notify.error("Nhập tên và SĐT");
      return;
    }
    const id = uid("cus");
    await db.customers.add({
      id,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
    });
    notify.success("Đã thêm khách");
    setName("");
    setPhone("");
  };

  return (
    <AppShell>
      <h1 className="mb-1 text-lg font-bold">Khách hàng</h1>
      <p className="mb-4 text-sm text-slate-500">
        SĐT · lịch sử · khách quay lại · tra cứu nhanh
      </p>

      <Card className="mb-4 space-y-2 p-4">
        <Input
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button className="w-full" onClick={() => void onAdd()}>
          Thêm khách
        </Button>
      </Card>

      <Input
        className="mb-3 !rounded-full"
        placeholder="Tra cứu tên / SĐT…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map((c) => {
          const count = stats.get(c.id) ?? 0;
          return (
            <Link key={c.id} href={`/khach-hang/${c.id}`}>
              <Card className="flex items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.phone}</p>
                  {c.note ? (
                    <p className="text-xs text-slate-400">{c.note}</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-[var(--brand-50)] px-2 py-1 text-[10px] font-bold text-[var(--brand-600)]">
                  {count} đơn
                  {count >= 2 ? " · quay lại" : ""}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
