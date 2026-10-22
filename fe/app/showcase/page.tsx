"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { formatVnd, uid } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useEffect } from "react";

/**
 * Public showcase — không cần login.
 * Form yêu cầu lưu vào meta (local) — chưa gửi server / Zalo OA.
 */
export default function ShowcasePage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void ensureSeeded().then(() => setReady(true));
  }, []);

  const settings = useLiveQuery(() => db.settings.get("store"), [ready]);
  const garments = useLiveQuery(
    () => db.garments.filter((g) => g.active && g.status === "ready").toArray(),
    [ready],
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [garmentId, setGarmentId] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const list = useMemo(() => garments ?? [], [garments]);

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

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">
              {settings?.name ?? "Studio Thuê"}
            </h1>
            <p className="truncate text-sm text-slate-500">
              {settings?.slogan ?? "Xem mẫu · gửi yêu cầu đặt lịch"}
            </p>
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold text-[var(--brand-600)]"
          >
            Nhân viên
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <section aria-labelledby="catalog-h">
          <h2 id="catalog-h" className="mb-3 font-bold">
            Mẫu sẵn sàng cho thuê
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((g) => (
              <Card key={g.id} className="overflow-hidden">
                <div className="flex h-28 items-center justify-center bg-[var(--brand-50)]">
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
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-400">{g.code}</p>
                  <p className="line-clamp-2 text-sm font-bold">{g.name}</p>
                  <p className="text-xs text-slate-500">
                    {g.size} · {g.color}
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    {formatVnd(g.rentPrice)}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[var(--brand-600)]"
                    onClick={() => setGarmentId(g.id)}
                  >
                    Chọn mẫu này
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="form-h">
          <h2 id="form-h" className="mb-3 font-bold">
            Gửi yêu cầu đặt lịch
          </h2>
          <Card className="space-y-3 p-4">
            {sent ? (
              <p className="text-sm text-emerald-700">
                Cảm ơn bạn — studio sẽ liên hệ lại (yêu cầu lưu trên máy demo,
                chưa gửi server).
              </p>
            ) : (
              <>
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
                  <option value="">— Chọn mẫu (tuỳ chọn) —</option>
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
                  Gửi yêu cầu
                </Button>
                <p className="text-[11px] text-slate-400">
                  TODO: nối form → Zalo OA / email studio khi có backend.
                </p>
              </>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
