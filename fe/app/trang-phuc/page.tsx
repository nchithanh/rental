"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  attrsFromForm,
  getAttributeDefs,
} from "@/lib/attribute-defs";
import { db, GARMENT_STATUS_LABEL } from "@/lib/db";
import { garmentStatusTone } from "@/lib/labels";
import { cn, formatVnd, uid } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useVertical, useVerticalCopy } from "@/lib/vertical";
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

function defaultAttrValues(
  vertical: "trang-phuc" | "thue-xe",
): Record<string, string> {
  if (vertical === "thue-xe") {
    return {
      transmission: "Số tự động",
      seats: "5 chỗ",
      fuel: "Xăng",
      consumption: "8L/100km",
      brand: "",
      year: "2024",
      delivery: "Nhận tại showroom",
      description: "",
      amenities:
        "Bản đồ · Bluetooth · Camera hành trình · Camera lùi · Định vị GPS · Lốp dự phòng · ETC · Túi khí an toàn",
      document_opt1: "GPLX (đối chiếu) & Passport (giữ lại)",
      document_opt2: "GPLX (đối chiếu) & CCCD (đối chiếu VNeID)",
      collateral:
        "Không yêu cầu khách thuê thế chấp Tiền mặt hoặc Xe máy",
      terms: "",
    };
  }
  return {
    size: "M",
    color: "",
    category: "Váy",
    material: "",
    style: "",
    occasion: "",
    brand_label: "",
    length: "Midi",
    description: "",
    amenities: "Túi nhỏ · Thắt lưng",
    document_opt1: "CCCD (đối chiếu) & đặt cọc theo bảng giá",
    document_opt2: "Passport (giữ lại) & đặt cọc theo bảng giá",
    collateral: "Cọc tiền mặt hoặc CK bằng giá cọc mặc định",
    terms: "",
  };
}

export default function GarmentsPage() {
  const vertical = useVertical();
  const copy = useVerticalCopy();
  const attrDefs = getAttributeDefs(vertical);
  const garments = useLiveQuery(() => db.garments.orderBy("code").toArray());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    rentPrice: "1000000",
    depositDefault: "1500000",
    imageUrl: "",
    emoji: copy.emojiFallback,
    attrs: defaultAttrValues(vertical),
  });

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
    const mapped = attrsFromForm(vertical, form.attrs);
    await db.garments.add({
      id,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      emoji: form.emoji || copy.emojiFallback,
      imageUrl: form.imageUrl.trim() || undefined,
      size: mapped.size,
      color: mapped.color,
      category: mapped.category,
      attrs: mapped.attrs,
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
      note: `Thêm ${copy.assetSingular}`,
      createdAt: new Date().toISOString(),
    });
    notify.success(`Đã thêm ${copy.assetSingular}`);
    setAdding(false);
    setForm({
      code: "",
      name: "",
      rentPrice: "1000000",
      depositDefault: "1500000",
      imageUrl: "",
      emoji: copy.emojiFallback,
      attrs: defaultAttrValues(vertical),
    });
  };

  return (
    <AppShell>
      <PageHeader
        title={copy.catalog}
        description="Ảnh · thuộc tính · giá · tình trạng"
        actions={
          <Button size="sm" variant="default" onClick={() => setAdding((v) => !v)}>
            {adding ? "Đóng" : "+ Thêm"}
          </Button>
        }
      />

      {adding ? (
        <Card className="mb-4 space-y-2 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Mã"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <Input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {attrDefs
              .filter((d) => (d.kind ?? "text") === "text")
              .map((def) => (
                <Input
                  key={def.key}
                  placeholder={def.label}
                  value={form.attrs[def.key] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attrs: { ...form.attrs, [def.key]: e.target.value },
                    })
                  }
                />
              ))}
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
          {attrDefs
            .filter((d) => d.kind === "long" || d.kind === "chips")
            .map((def) => (
              <textarea
                key={def.key}
                className="w-full rounded-[10px] border px-3 py-2 text-sm"
                rows={def.kind === "chips" ? 2 : 3}
                placeholder={
                  def.kind === "chips"
                    ? `${def.label} (cách nhau bởi · )`
                    : def.label
                }
                value={form.attrs[def.key] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attrs: { ...form.attrs, [def.key]: e.target.value },
                  })
                }
              />
            ))}
          <Input
            placeholder="URL hình ảnh (tuỳ chọn)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <Button className="w-full" onClick={() => void onAdd()}>
            Lưu {copy.assetSingular}
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
                ? "bg-[var(--brand-500)] text-white"
                : "border border-[var(--border)] bg-white text-slate-900",
            )}
          >
            {s === "all" ? "Tất cả" : GARMENT_STATUS_LABEL[s]}{" "}
            <span className="opacity-80">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-6 lg:gap-3">
        {filtered.map((g) => (
          <Link key={g.id} href={`/trang-phuc/${g.id}`} className="min-w-0">
            <article className="group h-full">
              <div className="relative aspect-square overflow-hidden rounded-[10px] bg-[var(--brand-50)] sm:aspect-[5/6]">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.imageUrl}
                    alt={g.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-4xl">
                    {g.emoji ?? "👗"}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute top-2 right-2 max-w-[70%] truncate rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                    garmentStatusTone(g.status),
                  )}
                >
                  {GARMENT_STATUS_LABEL[g.status]}
                </span>
              </div>
              <div className="mt-2 space-y-0.5 px-0.5">
                <h2 className="line-clamp-2 min-h-10 text-sm font-bold text-slate-900">
                  {g.name}
                  {g.size ? ` · ${g.size}` : ""}
                </h2>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-base font-bold tabular-nums text-[var(--brand-600)]">
                    {formatVnd(g.rentPrice)}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {g.code}
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
