"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { cn, uid } from "@/lib/utils";

export default function CustomersPage() {
  const customers = useLiveQuery(() => db.customers.orderBy("name").toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; lastAt?: string }>();
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      const cur = m.get(o.customerId) ?? { count: 0 };
      cur.count += 1;
      if (!cur.lastAt || o.createdAt > cur.lastAt) cur.lastAt = o.createdAt;
      m.set(o.customerId, cur);
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
      .sort(
        (a, b) => (stats.get(b.id)?.count ?? 0) - (stats.get(a.id)?.count ?? 0),
      );
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
    setFormOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Khách hàng"
        description="SĐT · lịch sử · khách quay lại · tra cứu nhanh"
        actions={
          <Button
            size="sm"
            variant="default"
            onClick={() => setFormOpen((v) => !v)}
          >
            {formOpen ? "Đóng" : "+ Thêm khách"}
          </Button>
        }
      />

      {formOpen ? (
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
            Lưu khách
          </Button>
        </Card>
      ) : null}

      <Input
        className="mb-4 !rounded-full"
        placeholder="Tra cứu tên / SĐT…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-4 gap-3 border-b border-[var(--border)] bg-[var(--banner)]/60 px-4 py-2.5 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:grid">
          <span>Khách</span>
          <span>Số điện thoại</span>
          <span>Đơn</span>
          <span>Ghi chú</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Không tìm thấy khách.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {filtered.map((c) => {
              const st = stats.get(c.id);
              const count = st?.count ?? 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/khach-hang/${c.id}`}
                    className="grid grid-cols-1 gap-1 px-4 py-3 text-left transition hover:bg-[var(--brand-50)]/50 sm:grid-cols-4 sm:items-center sm:gap-3"
                  >
                    <div className="flex items-start justify-between gap-2 sm:block">
                      <span className="block truncate font-semibold text-slate-900">
                        {c.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:hidden",
                          count >= 2
                            ? "bg-[var(--brand-50)] text-[var(--brand-600)]"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {count} đơn
                        {count >= 2 ? " · quay lại" : ""}
                      </span>
                    </div>
                    <span className="block truncate text-sm text-slate-600">
                      {c.phone}
                    </span>
                    <span
                      className={cn(
                        "hidden truncate rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-block sm:w-fit",
                        count >= 2
                          ? "bg-[var(--brand-50)] text-[var(--brand-600)]"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {count} đơn
                      {count >= 2 ? " · quay lại" : ""}
                    </span>
                    <span className="block truncate text-xs text-slate-400 sm:text-sm">
                      {c.note?.trim() || "—"}
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
