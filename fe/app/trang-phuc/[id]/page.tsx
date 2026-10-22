"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShowcaseAttrList } from "@/components/showcase-attrs";
import {
  attrsFromForm,
  getAttrValue,
  getAttributeDefs,
} from "@/lib/attribute-defs";
import { db, GARMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from "@/lib/db";
import { garmentStatusTone, orderStatusTone } from "@/lib/labels";
import { cn, formatDateTime, formatVnd, uid } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useVertical, useVerticalCopy } from "@/lib/vertical";
import type { GarmentStatus } from "@/types";

export default function GarmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const vertical = useVertical();
  const copy = useVerticalCopy();
  const attrDefs = getAttributeDefs(vertical);
  const garment = useLiveQuery(() => db.garments.get(id), [id]);
  const events = useLiveQuery(
    () =>
      db.garmentEvents.where("garmentId").equals(id).sortBy("createdAt"),
    [id],
  );
  const orders = useLiveQuery(async () => {
    const all = await db.orders.toArray();
    return all
      .filter((o) => o.lines.some((l) => l.garmentId === id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [id]);
  const customers = useLiveQuery(() => db.customers.toArray());

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    rentPrice: "",
    depositDefault: "",
    imageUrl: "",
    emoji: "",
    note: "",
    attrs: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!garment) return;
    const attrs: Record<string, string> = {};
    for (const def of getAttributeDefs(vertical)) {
      attrs[def.key] = getAttrValue(garment, def);
    }
    setForm({
      name: garment.name,
      code: garment.code,
      rentPrice: String(garment.rentPrice),
      depositDefault: String(garment.depositDefault),
      imageUrl: garment.imageUrl ?? "",
      emoji: garment.emoji ?? copy.emojiFallback,
      note: garment.note ?? "",
      attrs,
    });
  }, [garment, vertical, copy.emojiFallback]);

  const setStatus = async (status: GarmentStatus) => {
    if (!garment) return;
    if (
      (garment.status === "renting" || garment.status === "booked") &&
      status === "ready"
    ) {
      const active = (orders ?? []).some(
        (o) =>
          o.status !== "returned" &&
          o.status !== "cancelled" &&
          o.lines.some((l) => l.garmentId === id),
      );
      if (active) {
        notify.error("Còn đơn chưa kết thúc — không đặt Sẵn sàng");
        return;
      }
    }
    await db.garments.update(id, { status });
    await db.garmentEvents.add({
      id: uid("evt"),
      garmentId: id,
      type: "status",
      note: `Đổi trạng thái → ${GARMENT_STATUS_LABEL[status]}`,
      createdAt: new Date().toISOString(),
    });
    notify.success("Đã cập nhật tình trạng");
  };

  const saveEdit = async () => {
    if (!garment) return;
    const mapped = attrsFromForm(vertical, form.attrs);
    await db.garments.update(id, {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      size: mapped.size,
      color: mapped.color,
      category: mapped.category,
      attrs: mapped.attrs,
      rentPrice: Number(form.rentPrice) || 0,
      depositDefault: Number(form.depositDefault) || 0,
      imageUrl: form.imageUrl.trim() || undefined,
      emoji: form.emoji || copy.emojiFallback,
      note: form.note.trim() || undefined,
    });
    await db.garmentEvents.add({
      id: uid("evt"),
      garmentId: id,
      type: "status",
      note: "Cập nhật thông tin / giá thuê",
      createdAt: new Date().toISOString(),
    });
    notify.success(`Đã lưu ${copy.assetSingular}`);
    setEditing(false);
  };

  if (!garment) {
    return (
      <AppShell>
        <p className="text-slate-500">Không tìm thấy {copy.assetSingular}.</p>
        <Link href="/trang-phuc" className="text-[var(--brand-600)]">
          ← Danh sách
        </Link>
      </AppShell>
    );
  }

  const cusName = (cid: string) =>
    customers?.find((c) => c.id === cid)?.name ?? "Khách";

  return (
    <AppShell>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link
          href="/trang-phuc"
          className="text-sm font-semibold text-[var(--brand-600)]"
        >
          ← {copy.catalog}
        </Link>
        <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
          {editing ? "Huỷ sửa" : "Sửa"}
        </Button>
      </div>

      <Card className="mb-4 overflow-hidden">
        <div className="flex h-44 items-center justify-center bg-[var(--brand-50)]">
          {garment.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={garment.imageUrl}
              alt={garment.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-6xl">
              {garment.emoji ?? copy.emojiFallback}
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400">{garment.code}</p>
              <h1 className="text-xl font-bold">{garment.name}</h1>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-bold",
                garmentStatusTone(garment.status),
              )}
            >
              {GARMENT_STATUS_LABEL[garment.status]}
            </span>
          </div>
          <p className="mt-2 font-bold">
            Thuê {formatVnd(garment.rentPrice)} · Cọc{" "}
            {formatVnd(garment.depositDefault)}
          </p>
          {garment.note ? (
            <p className="mt-1 text-sm text-slate-500">{garment.note}</p>
          ) : null}
          <div className="mt-3">
            <ShowcaseAttrList item={garment} />
          </div>
        </div>
      </Card>

      {editing ? (
        <Card className="mb-4 space-y-2 p-4">
          <h2 className="font-bold">Sửa thông tin</h2>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Mã"
            />
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tên"
            />
            {attrDefs
              .filter((d) => (d.kind ?? "text") === "text")
              .map((def) => (
                <Input
                  key={def.key}
                  value={form.attrs[def.key] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attrs: { ...form.attrs, [def.key]: e.target.value },
                    })
                  }
                  placeholder={def.label}
                />
              ))}
            <Input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              placeholder="Emoji"
            />
            <Input
              type="number"
              value={form.rentPrice}
              onChange={(e) => setForm({ ...form, rentPrice: e.target.value })}
              placeholder="Giá thuê"
            />
            <Input
              type="number"
              value={form.depositDefault}
              onChange={(e) =>
                setForm({ ...form, depositDefault: e.target.value })
              }
              placeholder="Cọc"
            />
          </div>
          {attrDefs
            .filter((d) => d.kind === "long" || d.kind === "chips")
            .map((def) => (
              <textarea
                key={def.key}
                className="w-full rounded-[10px] border px-3 py-2 text-sm"
                rows={def.kind === "chips" ? 2 : 3}
                value={form.attrs[def.key] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attrs: { ...form.attrs, [def.key]: e.target.value },
                  })
                }
                placeholder={
                  def.kind === "chips"
                    ? `${def.label} (cách nhau bởi · )`
                    : def.label
                }
              />
            ))}
          <Input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="URL hình"
          />
          <Input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Ghi chú"
          />
          <Button className="w-full" onClick={() => void saveEdit()}>
            Lưu thay đổi
          </Button>
        </Card>
      ) : null}

      <h2 className="mb-2 font-bold">Tình trạng</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            "ready",
            "booked",
            "renting",
            "awaiting_return",
            "laundry",
            "repair",
          ] as GarmentStatus[]
        ).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={garment.status === s ? "default" : "outline"}
            onClick={() => void setStatus(s)}
          >
            {GARMENT_STATUS_LABEL[s]}
          </Button>
        ))}
      </div>

      <h2 className="mb-2 font-bold">
        Lịch sử cho thuê ({orders?.length ?? 0})
      </h2>
      <div className="mb-4 space-y-2">
        {(orders ?? []).length === 0 ? (
          <Card className="p-3 text-sm text-slate-500">Chưa có đơn</Card>
        ) : (
          (orders ?? []).map((o) => {
            const line = o.lines.find((l) => l.garmentId === id);
            return (
              <Link key={o.id} href={`/don-thue/${o.id}`}>
                <Card className="flex items-center justify-between gap-2 p-3">
                  <div>
                    <p className="font-semibold">{o.code}</p>
                    <p className="text-xs text-slate-500">
                      {cusName(o.customerId)} · {o.startDate} → {o.endDate}
                    </p>
                    {line ? (
                      <p className="text-xs text-slate-400">
                        Thuê {formatVnd(line.rentPrice)} · cọc{" "}
                        {formatVnd(line.deposit)}
                      </p>
                    ) : null}
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
            );
          })
        )}
      </div>

      <h2 className="mb-2 font-bold">Nhật ký</h2>
      <div className="space-y-2">
        {[...(events ?? [])].reverse().map((e) => (
          <Card key={e.id} className="p-3 text-sm">
            <p className="font-medium">{e.note}</p>
            <p className="text-xs text-slate-400">
              {formatDateTime(e.createdAt)}
              {e.orderId ? (
                <>
                  {" · "}
                  <Link
                    href={`/don-thue/${e.orderId}`}
                    className="font-semibold text-[var(--brand-600)]"
                  >
                    xem đơn
                  </Link>
                </>
              ) : null}
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
