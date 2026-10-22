"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, GARMENT_STATUS_LABEL } from "@/lib/db";
import { garmentStatusTone } from "@/lib/labels";
import { cn, formatVnd, uid } from "@/lib/utils";
import { notify } from "@/lib/notify";
import type { GarmentStatus } from "@/types";

const STATUSES: (GarmentStatus | "all")[] = [
  "all",
  "ready",
  "booked",
  "renting",
  "awaiting_return",
  "laundry",
  "repair",
];

const emptyForm = {
  code: "",
  name: "",
  size: "M",
  color: "",
  category: "Váy",
  rentPrice: "1000000",
  depositDefault: "1500000",
  imageUrl: "",
  emoji: "👗",
};

export default function GarmentsPage() {
  const garments = useLiveQuery(() => db.garments.orderBy("code").toArray());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: 0 };
    for (const s of STATUSES) if (s !== "all") m[s] = 0;
    for (const g of garments ?? []) {
      if (!g.active) continue;
      m.all += 1;
      m[g.status] = (m[g.status] ?? 0) + 1;
    }
    return m;
  }, [garments]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (garments ?? []).filter((g) => {
      if (!g.active) return false;
      if (status !== "all" && g.status !== status) return false;
      if (!query) return true;
      return (
        g.name.toLowerCase().includes(query) ||
        g.code.toLowerCase().includes(query) ||
        g.color.toLowerCase().includes(query) ||
        g.category.toLowerCase().includes(query)
      );
    });
  }, [garments, q, status]);

  const onAdd = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      notify.error("Nhập mã và tên");
      return;
    }
    const id = uid("g");
    await db.garments.add({
      id,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      emoji: form.emoji || "👗",
      imageUrl: form.imageUrl.trim() || undefined,
      size: form.size,
      color: form.color || "—",
      category: form.category,
      rentPrice: Number(form.rentPrice) || 0,
      depositDefault: Number(form.depositDefault) || 0,
      status: "ready",
      active: true,
      createdAt: new Date().toISOString(),
    });
    await db.garmentEvents.add({
      id: uid("evt"),
      garmentId: id,
      type: "created",
      note: "Thêm trang phục",
      createdAt: new Date().toISOString(),
    });
    notify.success("Đã thêm trang phục");
    setAdding(false);
    setForm(emptyForm);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Trang phục</h1>
          <p className="text-sm text-slate-500">
            Hình · mã · size · màu · giá thuê · tình trạng
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "Đóng" : "+ Thêm"}
        </Button>
      </div>

      {adding ? (
        <Card className="mb-4 space-y-2 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Mã đồ"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <Input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Size"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
            <Input
              placeholder="Màu"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
            <Input
              placeholder="Danh mục"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
            <Input
              placeholder="Giá thuê"
              type="number"
              value={form.rentPrice}
              onChange={(e) => setForm({ ...form, rentPrice: e.target.value })}
            />
            <Input
              placeholder="Cọc mặc định"
              type="number"
              value={form.depositDefault}
              onChange={(e) =>
                setForm({ ...form, depositDefault: e.target.value })
              }
            />
          </div>
          <Input
            placeholder="URL hình ảnh (tuỳ chọn)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <Button className="w-full" onClick={() => void onAdd()}>
            Lưu trang phục
          </Button>
        </Card>
      ) : null}

      <Input
        className="mb-3 !rounded-full"
        placeholder="Tìm tên / mã / màu / danh mục…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              status === s
                ? "bg-emerald-500 text-white"
                : "border bg-white text-slate-600",
            )}
          >
            {s === "all" ? "Tất cả" : GARMENT_STATUS_LABEL[s]}{" "}
            <span className="opacity-80">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {filtered.map((g) => (
          <Link key={g.id} href={`/trang-phuc/${g.id}`}>
            <Card className="h-full overflow-hidden transition hover:ring-1 hover:ring-[var(--brand-300)]">
              <div className="relative flex h-28 items-center justify-center bg-[var(--brand-50)] sm:h-36">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.imageUrl}
                    alt={g.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl">{g.emoji ?? "👗"}</span>
                )}
                <span
                  className={cn(
                    "absolute top-1.5 right-1.5 max-w-[70%] truncate rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:top-2 sm:right-2 sm:text-[10px]",
                    garmentStatusTone(g.status),
                  )}
                >
                  {GARMENT_STATUS_LABEL[g.status]}
                </span>
              </div>
              <div className="p-2.5 sm:p-4">
                <p className="text-[10px] text-slate-400 sm:text-xs">{g.code}</p>
                <h2 className="line-clamp-2 text-sm font-bold sm:text-base">
                  {g.name}
                </h2>
                <p className="truncate text-[11px] text-slate-500 sm:text-sm">
                  {g.size} · {g.color}
                </p>
                <p className="mt-1.5 text-sm font-bold text-emerald-700 sm:mt-2 sm:text-base">
                  {formatVnd(g.rentPrice)}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
