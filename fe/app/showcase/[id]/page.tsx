"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ShowcaseAttrList } from "@/components/showcase-attrs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { ensureSeeded } from "@/lib/seed";
import { formatVnd, uid } from "@/lib/utils";
import { getVerticalCopy, useVertical } from "@/lib/vertical";

export default function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const vertical = useVertical();
  const copy = getVerticalCopy(vertical);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    void ensureSeeded().then(() => setReady(true));
  }, []);

  const settings = useLiveQuery(() => db.settings.get("store"), [ready]);
  const garment = useLiveQuery(() => db.garments.get(id), [id, ready]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      notify.error("Nhập tên và SĐT");
      return;
    }
    await db.meta.put({
      key: `showcase_req_${uid("req")}`,
      value: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        garmentId: id,
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

  if (!garment || !garment.active) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <p className="text-slate-500">Không tìm thấy mẫu.</p>
        <Link href="/showcase" className="text-[var(--brand-600)]">
          ← Trưng bày
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] pb-28">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <BrandMark className="h-9 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {settings?.name ?? copy.appTitle}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              Chi tiết {copy.assetSingular}
            </p>
          </div>
          <Link
            href="/showcase"
            className="text-xs font-semibold text-[var(--brand-600)]"
          >
            ← Catalog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4">
        <Card className="overflow-hidden">
          <div className="flex aspect-[4/3] items-center justify-center bg-[var(--brand-50)]">
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
          <div className="space-y-2 p-4">
            <p className="text-xs text-slate-400">{garment.code}</p>
            <h1 className="text-xl font-bold">{garment.name}</h1>
            <p className="text-lg font-bold text-emerald-700">
              {formatVnd(garment.rentPrice)}
              <span className="text-sm font-normal text-slate-400">
                {vertical === "thue-xe" ? " / ngày" : " / lượt"}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Cọc mặc định {formatVnd(garment.depositDefault)}
            </p>
            {garment.status !== "ready" ? (
              <p className="text-xs font-semibold text-amber-700">
                Hiện chưa sẵn sàng cho thuê công khai
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-700">
                Sẵn sàng · đặt lịch ngay
              </p>
            )}
          </div>
        </Card>

        <section aria-labelledby="attrs-h">
          <h2 id="attrs-h" className="mb-2 font-bold">
            Thuộc tính
          </h2>
          <ShowcaseAttrList item={garment} />
        </section>

        {garment.note ? (
          <Card className="p-4 text-sm text-slate-600">{garment.note}</Card>
        ) : null}

        <Card className="space-y-1 p-4 text-sm text-slate-600">
          <p className="font-bold text-slate-900">
            {settings?.name ?? copy.appTitle}
          </p>
          {settings?.phone ? (
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-1 text-[var(--brand-600)]"
            >
              <Phone size={14} /> {settings.phone}
            </a>
          ) : null}
          {settings?.address ? (
            <p className="inline-flex items-start gap-1">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {settings.address}
            </p>
          ) : null}
        </Card>

        {(showForm || sent) && (
          <section id="book-form" aria-labelledby="book-h" className="scroll-mt-24">
            <h2 id="book-h" className="mb-2 font-bold">
              Đặt lịch thuê
            </h2>
            <Card className="space-y-3 p-4">
              {sent ? (
                <p className="text-sm text-emerald-700">
                  Cảm ơn bạn — chúng tôi sẽ liên hệ lại (demo local).
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
                  <Input
                    placeholder="Ngày mong muốn / ghi chú"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button className="w-full" onClick={() => void submit()}>
                    Gửi yêu cầu đặt lịch
                  </Button>
                </>
              )}
            </Card>
          </section>
        )}
      </main>

      {!sent ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-950/95">
          <div className="mx-auto flex max-w-lg gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/showcase")}
            >
              Catalog
            </Button>
            <Button
              type="button"
              className="flex-[2]"
              onClick={() => {
                setShowForm(true);
                requestAnimationFrame(() => {
                  document
                    .getElementById("book-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                });
              }}
            >
              Đặt lịch thuê
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
