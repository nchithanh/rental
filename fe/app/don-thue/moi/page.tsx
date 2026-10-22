"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, GARMENT_STATUS_LABEL } from "@/lib/db";
import { garmentStatusTone } from "@/lib/labels";
import { createRentalOrder, isGarmentAvailable } from "@/lib/rental";
import { cn, formatVnd } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useRentalCartStore } from "@/stores/rental-cart-store";
import type { Garment, OrderStatus } from "@/types";

export default function NewOrderPage() {
  const router = useRouter();
  const customers = useLiveQuery(() => db.customers.toArray());
  const garments = useLiveQuery(() =>
    db.garments.filter((g) => g.active).toArray(),
  );

  const lines = useRentalCartStore((s) => s.lines);
  const customerId = useRentalCartStore((s) => s.customerId);
  const startDate = useRentalCartStore((s) => s.startDate);
  const endDate = useRentalCartStore((s) => s.endDate);
  const note = useRentalCartStore((s) => s.note);
  const status = useRentalCartStore((s) => s.status);
  const addGarment = useRentalCartStore((s) => s.addGarment);
  const removeGarment = useRentalCartStore((s) => s.removeGarment);
  const setCustomerId = useRentalCartStore((s) => s.setCustomerId);
  const setDates = useRentalCartStore((s) => s.setDates);
  const setNote = useRentalCartStore((s) => s.setNote);
  const setStatus = useRentalCartStore((s) => s.setStatus);
  const clear = useRentalCartStore((s) => s.clear);
  const has = useRentalCartStore((s) => s.has);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mobileCart, setMobileCart] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bumpId, setBumpId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const g of garments ?? []) set.add(g.category);
    return [...set].sort();
  }, [garments]);

  const gMap = useMemo(() => {
    const m = new Map<string, Garment>();
    for (const g of garments ?? []) m.set(g.id, g);
    return m;
  }, [garments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (garments ?? []).filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.code.toLowerCase().includes(q) ||
        g.color.toLowerCase().includes(q)
      );
    });
  }, [garments, query, category]);

  const totals = useMemo(
    () => ({
      rent: lines.reduce((s, l) => s + l.rentPrice, 0),
      deposit: lines.reduce((s, l) => s + l.deposit, 0),
    }),
    [lines],
  );

  const tryAdd = async (g: Garment) => {
    if (has(g.id)) {
      notify.info("Đã có trong giỏ");
      return;
    }
    const check = await isGarmentAvailable(g.id, startDate, endDate);
    if (!check.ok) {
      notify.error(check.reason);
      return;
    }
    addGarment({
      garmentId: g.id,
      rentPrice: g.rentPrice,
      deposit: g.depositDefault,
    });
    setBumpId(g.id);
    window.setTimeout(() => setBumpId(null), 280);
    notify.success(`Đã thêm ${g.code}`);
  };

  const onSubmit = async () => {
    if (!customerId) {
      notify.error("Chọn khách hàng");
      setMobileCart(true);
      return;
    }
    if (!lines.length) {
      notify.error("Giỏ trống — thêm trang phục");
      return;
    }
    setBusy(true);
    try {
      const order = await createRentalOrder({
        customerId,
        startDate,
        endDate,
        lines,
        note: note || undefined,
        status,
      });
      clear();
      setMobileCart(false);
      notify.success(`Đã tạo ${order.code}`);
      router.replace(`/don-thue/${order.id}`);
    } catch (e) {
      notify.fromError(e, "Không tạo được đơn");
    } finally {
      setBusy(false);
    }
  };

  const CartBody = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Giỏ thuê ({lines.length})</h2>
        <Button
          variant="ghost"
          size="sm"
          disabled={!lines.length}
          onClick={() => clear()}
        >
          Xóa giỏ
        </Button>
      </div>

      <label className="mb-2 block text-sm">
        <span className="mb-1 block font-medium text-slate-500">Khách</span>
        <select
          className="w-full rounded-[10px] border px-3 py-2"
          value={customerId ?? ""}
          onChange={(e) => setCustomerId(e.target.value || undefined)}
        >
          <option value="">— Chọn —</option>
          {(customers ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.phone}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-500">Nhận</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setDates(e.target.value, endDate)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-500">Trả</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setDates(startDate, e.target.value)}
          />
        </label>
      </div>

      <label className="mb-2 block text-sm">
        <span className="mb-1 block font-medium text-slate-500">
          Trạng thái ban đầu
        </span>
        <select
          className="w-full rounded-[10px] border px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          <option value="scheduled">Đặt lịch</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="renting">Đang thuê (đã giao)</option>
        </select>
      </label>

      <Input
        className="mb-3"
        placeholder="Ghi chú đơn"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {lines.length === 0 ? (
          <Card className="p-4 text-sm text-slate-500">
            Chạm <strong>+ Thêm</strong> trên trang phục để bỏ vào giỏ.
          </Card>
        ) : (
          lines.map((l) => {
            const g = gMap.get(l.garmentId);
            return (
              <Card
                key={l.garmentId}
                className="flex items-center gap-2 p-3"
              >
                <span className="text-2xl">{g?.emoji ?? "👗"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {g?.code} · {g?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Thuê {formatVnd(l.rentPrice)} · cọc {formatVnd(l.deposit)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa khỏi giỏ"
                  onClick={() => removeGarment(l.garmentId)}
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-3 space-y-2 border-t pt-3">
        <div className="flex justify-between text-sm">
          <span>{lines.length} món</span>
          <span className="font-bold">
            Thuê {formatVnd(totals.rent)} · Cọc {formatVnd(totals.deposit)}
          </span>
        </div>
        <Button
          className="w-full"
          disabled={busy || !lines.length || !customerId}
          onClick={() => void onSubmit()}
        >
          {busy ? "Đang tạo…" : "Tạo đơn thuê"}
        </Button>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-3 lg:h-[calc(100dvh-7.5rem)] lg:flex-row">
        <section className="min-w-0 flex-1">
          <div className="mb-3 rounded-[12px] bg-[var(--banner)] px-4 py-3">
            <h1 className="text-lg font-bold">Tạo đơn thuê</h1>
            <p className="text-sm text-slate-600">
              Thêm đồ vào giỏ · kiểm tra lịch trống · tạo đơn
            </p>
          </div>

          {lines.length > 0 ? (
            <button
              type="button"
              onClick={() => setMobileCart(true)}
              className="sticky top-0 z-20 mb-3 flex w-full items-center justify-between gap-3 rounded-full bg-emerald-500 px-5 py-3.5 text-white shadow-lg lg:hidden"
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <ShoppingBag size={18} />
                {lines.length} món
              </span>
              <span className="font-bold tabular-nums">
                {formatVnd(totals.rent)}
              </span>
            </button>
          ) : null}

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                category === "all"
                  ? "bg-emerald-500 text-white"
                  : "border bg-white text-slate-600",
              )}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                  category === c
                    ? "bg-emerald-500 text-white"
                    : "border bg-white text-slate-600",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <Input
            className="mb-3 !rounded-full"
            placeholder="Tìm mã / tên / màu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2.5 pb-28 sm:gap-3 md:grid-cols-3 lg:pb-0 xl:grid-cols-3">
            {filtered.map((g) => {
              const inCart = has(g.id);
              return (
                <article
                  key={g.id}
                  className={cn(
                    "flex flex-col rounded-[12px] border bg-white p-2.5 shadow-sm transition sm:p-3",
                    bumpId === g.id && "ring-2 ring-emerald-400",
                    inCart
                      ? "border-emerald-300"
                      : "border-slate-200",
                  )}
                >
                  <div className="relative mb-2 flex h-24 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--brand-50)]">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.imageUrl}
                        alt={g.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">{g.emoji ?? "👗"}</span>
                    )}
                    <span
                      className={cn(
                        "absolute top-1.5 right-1.5 max-w-[75%] truncate rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        garmentStatusTone(g.status),
                      )}
                    >
                      {GARMENT_STATUS_LABEL[g.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{g.code}</p>
                  <h2 className="line-clamp-2 min-h-9 text-sm font-bold">
                    {g.name}
                  </h2>
                  <p className="truncate text-[11px] text-slate-500">
                    {g.size} · {g.color}
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {formatVnd(g.rentPrice)}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    variant={inCart ? "outline" : "default"}
                    disabled={inCart}
                    onClick={() => void tryAdd(g)}
                  >
                    {inCart ? (
                      "Đã trong giỏ"
                    ) : (
                      <>
                        <Plus size={14} /> Thêm
                      </>
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="hidden w-[340px] shrink-0 lg:block">
          <Card className="sticky top-0 flex h-[calc(100dvh-8rem)] flex-col p-4">
            {CartBody}
          </Card>
        </aside>
      </div>

      {mobileCart ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileCart(false)}
            aria-label="Đóng giỏ"
          />
          <div className="fixed inset-x-0 bottom-0 z-[51] flex max-h-[88vh] flex-col overflow-hidden rounded-t-[20px] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Giỏ thuê</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileCart(false)}
              >
                Đóng
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{CartBody}</div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
