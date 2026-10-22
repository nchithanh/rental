"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { MapPin, Phone, Share2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAttrValue, getFilterableDefs } from "@/lib/attribute-defs";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { ensureSeeded } from "@/lib/seed";
import { cn, formatVnd, uid } from "@/lib/utils";
import { getVerticalCopy, useVertical } from "@/lib/vertical";
import type { Garment } from "@/types";

/**
 * Public showcase — không cần login.
 * Form yêu cầu lưu local (meta) — chưa gửi server / Zalo OA.
 */
export default function ShowcasePage() {
  const router = useRouter();
  const vertical = useVertical();
  const copy = getVerticalCopy(vertical);
  const filterDefs = getFilterableDefs(vertical);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    void ensureSeeded().then(() => setReady(true));
  }, []);

  const settings = useLiveQuery(() => db.settings.get("store"), [ready]);
  const garments = useLiveQuery(
    () => db.garments.filter((g) => g.active && g.status === "ready").toArray(),
    [ready],
  );

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [garmentId, setGarmentId] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const list = useMemo(() => garments ?? [], [garments]);

  const filterOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const def of filterDefs) {
      const set = new Set<string>();
      for (const g of list) {
        const v = getAttrValue(g, def);
        if (v && v !== "—") set.add(v);
      }
      map[def.key] = Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
    }
    return map;
  }, [list, filterDefs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((g) => {
      for (const def of filterDefs) {
        const want = filters[def.key];
        if (!want || want === "all") continue;
        if (getAttrValue(g, def) !== want) return false;
      }
      if (!q) return true;
      const blob = [
        g.name,
        g.code,
        g.size,
        g.color,
        g.category,
        ...Object.values(g.attrs ?? {}),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [list, query, filters, filterDefs]);

  const selected = list.find((g) => g.id === garmentId);

  const pickBook = (g: Garment) => {
    setGarmentId(g.id);
    setFormOpen(true);
    setSent(false);
    requestAnimationFrame(() => {
      document.getElementById("book-form")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      notify.error("Nhập tên và SĐT");
      return;
    }
    const key = `showcase_req_${uid("req")}`;
    await db.meta.put({
      key,
      value: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        garmentId: garmentId || null,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      }),
    });
    setSent(true);
    notify.success("Đã ghi nhận yêu cầu (local demo)");
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: settings?.name ?? copy.appTitle,
          text: settings?.slogan,
          url,
        });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      notify.success("Đã copy link trưng bày");
    } catch {
      notify.error("Không chia sẻ được");
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] pb-28">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-start gap-3">
          <BrandMark className="mt-0.5 h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">
              {settings?.name ?? copy.appTitle}
            </h1>
            <p className="line-clamp-2 text-sm text-slate-500">
              {settings?.slogan ?? "Xem mẫu · đặt lịch nhanh"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              {settings?.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--brand-600)]"
                >
                  <Phone size={12} /> {settings.phone}
                </a>
              ) : null}
              {settings?.address ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {settings.address}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void share()}
            >
              <Share2 size={14} /> Chia sẻ
            </Button>
            <Link
              href="/login"
              className="text-[10px] font-semibold text-slate-400"
            >
              Nhân viên
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-4">
        <section aria-labelledby="catalog-h">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <h2 id="catalog-h" className="font-bold">
                {copy.catalog} sẵn sàng
              </h2>
              <p className="text-xs text-slate-500">
                {filtered.length}/{list.length} mẫu · bấm xem chi tiết hoặc đặt
                nhanh
              </p>
            </div>
          </div>

          <Input
            className="mb-3 !rounded-full"
            placeholder={`Tìm ${copy.assetSingular}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filterDefs.map((def) => {
            const opts = filterOptions[def.key] ?? [];
            if (!opts.length) return null;
            const active = filters[def.key] ?? "all";
            return (
              <div key={def.key} className="mb-2">
                <p className="mb-1 text-[11px] font-semibold text-slate-400">
                  {def.label}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <FilterChip
                    active={active === "all"}
                    label="Tất cả"
                    onClick={() =>
                      setFilters((f) => ({ ...f, [def.key]: "all" }))
                    }
                  />
                  {opts.map((opt) => (
                    <FilterChip
                      key={opt}
                      active={active === opt}
                      label={opt}
                      onClick={() =>
                        setFilters((f) => ({ ...f, [def.key]: opt }))
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-500">
              Không tìm thấy mẫu phù hợp.
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((g) => (
                <article
                  key={g.id}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-[10px] border bg-white shadow-sm dark:bg-slate-900",
                    garmentId === g.id
                      ? "border-[var(--brand-500)] ring-1 ring-[var(--brand-300)]"
                      : "border-slate-200",
                  )}
                >
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => router.push(`/showcase/${g.id}`)}
                  >
                    <div className="flex aspect-[4/3] items-center justify-center bg-[var(--brand-50)]">
                      {g.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.imageUrl}
                          alt={g.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">
                          {g.emoji ?? copy.emojiFallback}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 p-3 pb-0">
                      <p className="text-[10px] text-slate-400">{g.code}</p>
                      <h3 className="line-clamp-2 min-h-10 text-sm font-bold">
                        {g.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {g.size} · {g.category}
                      </p>
                      <p className="text-sm font-bold text-emerald-700">
                        {formatVnd(g.rentPrice)}
                        <span className="font-normal text-slate-400">
                          {vertical === "thue-xe" ? "/ngày" : "/lượt"}
                        </span>
                      </p>
                    </div>
                  </button>
                  <div className="mt-auto flex items-center gap-4 p-3 pt-1">
                    <button
                      type="button"
                      className="border-b border-[var(--brand-500)] pb-0.5 text-xs font-semibold text-[var(--brand-600)]"
                      onClick={() => router.push(`/showcase/${g.id}`)}
                    >
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      className="border-b border-[var(--brand-500)] pb-0.5 text-xs font-semibold text-[var(--brand-600)]"
                      onClick={() => pickBook(g)}
                    >
                      Đặt thuê
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {(formOpen || garmentId || sent) && (
          <section id="book-form" aria-labelledby="form-h" className="scroll-mt-24">
            <h2 id="form-h" className="mb-3 font-bold">
              Đặt lịch thuê nhanh
            </h2>
            <Card className="space-y-3 p-4">
              {sent ? (
                <p className="text-sm text-emerald-700">
                  Cảm ơn bạn — {settings?.name ?? "cửa hàng"} sẽ liên hệ lại
                  (yêu cầu lưu trên máy demo, chưa gửi server).
                </p>
              ) : (
                <>
                  {selected ? (
                    <p className="rounded-[10px] bg-[var(--brand-50)] px-3 py-2 text-sm">
                      Đang đặt:{" "}
                      <span className="font-bold">{selected.name}</span> ·{" "}
                      {formatVnd(selected.rentPrice)}
                    </p>
                  ) : null}
                  <Input
                    placeholder="Họ tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <select
                    className="w-full rounded-[10px] border px-3 py-2 text-sm"
                    value={garmentId}
                    onChange={(e) => setGarmentId(e.target.value)}
                  >
                    <option value="">— Chọn {copy.assetSingular} —</option>
                    {list.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.code} · {g.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Ngày mong muốn / ghi chú"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button className="w-full" onClick={() => void submit()}>
                    Gửi yêu cầu đặt lịch
                  </Button>
                  <p className="text-[11px] text-slate-400">
                    TODO: nối form → Zalo OA / email khi có backend.
                  </p>
                </>
              )}
            </Card>
          </section>
        )}
      </main>

      {selected && !sent ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-4xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{selected.name}</p>
              <p className="text-xs text-emerald-700">
                {formatVnd(selected.rentPrice)}
                {vertical === "thue-xe" ? "/ngày" : ""}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setFormOpen(true);
                document
                  .getElementById("book-form")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Đặt lịch ngay
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
        active
          ? "bg-[var(--brand-500)] text-white"
          : "border bg-white text-slate-600 dark:bg-slate-900",
      )}
    >
      {label}
    </button>
  );
}
