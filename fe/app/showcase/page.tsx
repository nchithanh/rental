"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CalendarDays,
  Heart,
  MapPin,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

function resolvePublicUrl(url: string): string {
  const raw = url.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${basePath}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

/** Banner theo lĩnh vực — nếu settings còn URL váy mặc định khi đang thuê xe → dùng banner xe. */
function resolveShowcaseBanner(
  settingsUrl: string | undefined,
  vertical: "trang-phuc" | "thue-xe",
): string {
  const dress = "/showcase-banner.jpg";
  const xe = "/showcase-banner-xe.jpg";
  let path = (settingsUrl || "").trim();
  if (!path) path = vertical === "thue-xe" ? xe : dress;
  if (
    vertical === "thue-xe" &&
    (path === dress || path.endsWith("/showcase-banner.jpg"))
  ) {
    path = xe;
  }
  return resolvePublicUrl(path);
}

function swatchColor(label: string): string {
  const c = label.toLowerCase();
  if (c.includes("trắng") || c.includes("kem") || c.includes("ivory")) return "#f5f0ea";
  if (c.includes("đen")) return "#1a2332";
  if (c.includes("hồng") || c.includes("blush")) return "#e8d5d0";
  if (c.includes("đỏ") || c.includes("burgundy")) return "#c45c5c";
  if (c.includes("navy") || c.includes("xanh đậm")) return "#2a3548";
  if (c.includes("xanh")) return "#5b8fa8";
  if (c.includes("vàng") || c.includes("gold")) return "#c9a962";
  if (c.includes("bạc") || c.includes("xám")) return "#9ca3af";
  if (c.includes("be") || c.includes("nude")) return "#d4c4b0";
  return "#5d5cc4";
}

const TRUST = [
  {
    icon: Sparkles,
    title: "CHẤT LƯỢNG CAO",
    desc: "Mẫu tuyển chọn, kiểm tra trước khi giao.",
  },
  {
    icon: ShieldCheck,
    title: "AN TOÀN & VỆ SINH",
    desc: "Giặt / vệ sinh chuẩn boutique trước mỗi lượt thuê.",
  },
  {
    icon: CalendarDays,
    title: "THUÊ DỄ DÀNG",
    desc: "Đặt lịch nhanh, liên hệ xác nhận trong ngày.",
  },
  {
    icon: Heart,
    title: "PHONG CÁCH RIÊNG",
    desc: "Nhiều lựa chọn cho ngày đặc biệt của bạn.",
  },
] as const;

export default function ShowcasePage() {
  const router = useRouter();
  const vertical = useVertical();
  const copy = getVerticalCopy(vertical);
  const filterDefs = getFilterableDefs(vertical);
  const priceUnit = vertical === "thue-xe" ? "/ ngày" : "/ 3 ngày";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortKey>("newest");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
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
    const rows = list.filter((g) => {
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
    const sorted = [...rows];
    sorted.sort((a, b) => {
      if (sort === "price_asc") return a.rentPrice - b.rentPrice;
      if (sort === "price_desc") return b.rentPrice - a.rentPrice;
      if (sort === "name") return a.name.localeCompare(b.name, "vi");
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    return sorted;
  }, [list, query, filters, filterDefs, sort]);

  const selected = list.find((g) => g.id === garmentId);

  const bannerSrc = resolveShowcaseBanner(
    settings?.showcaseBannerUrl,
    vertical,
  );
  const headline =
    settings?.showcaseHeadline?.trim() ||
    (vertical === "thue-xe"
      ? "BỘ SƯU TẬP XE THUÊ"
      : "BỘ SƯU TẬP VÁY CƯỚI & DỰ TIỆC");
  const sub =
    settings?.showcaseSub?.trim() ||
    (vertical === "thue-xe"
      ? "Tiện nghi. Minh bạch. Sẵn sàng lên đường."
      : "Sang trọng. Thanh lịch. Dành riêng cho bạn.");
  const badge =
    settings?.showcaseBadge?.trim() ||
    "KIỂU MẪU MỚI CẬP NHẬT LIÊN TỤC — ĐẶT CHỖ TRƯỚC ĐỂ ĐƯỢC ƯU TIÊN";

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
    await db.meta.put({
      key: `showcase_req_${uid("req")}`,
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
      <div className="flex min-h-dvh items-center justify-center bg-[var(--background)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--brand-500)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] pb-28">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link href="/showcase" className="flex min-w-0 items-center gap-2.5">
            <BrandMark className="h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-wide text-slate-900 uppercase sm:text-base">
                {settings?.name ?? copy.appTitle}
              </p>
              <p className="hidden truncate text-[10px] tracking-wide text-slate-500 uppercase sm:block">
                {settings?.slogan ?? "Thuê chất lượng cao"}
              </p>
            </div>
          </Link>

          <nav
            className="mx-auto hidden items-center gap-5 text-[11px] font-semibold tracking-wide text-slate-600 uppercase lg:flex"
            aria-label="Trưng bày"
          >
            <a href="#collection" className="text-[var(--brand-600)] underline decoration-2 underline-offset-8">
              Danh mục
            </a>
            <a href="#trust" className="hover:text-[var(--brand-600)]">
              Cam kết
            </a>
            <a href="#book-form" className="hover:text-[var(--brand-600)]">
              Đặt thuê
            </a>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="rounded-full p-2 text-slate-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
              onClick={() => {
                setSearchOpen(true);
                requestAnimationFrame(() =>
                  document.getElementById("showcase-search")?.focus(),
                );
              }}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              aria-label="Chia sẻ"
              className="rounded-full p-2 text-slate-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)]"
              onClick={() => void share()}
            >
              <Share2 size={18} />
            </button>
            <span
              className="relative rounded-full p-2 text-slate-400"
              title="Giỏ (demo)"
              aria-hidden
            >
              <ShoppingBag size={18} />
              <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--brand-500)] px-0.5 text-[9px] font-bold text-white">
                0
              </span>
            </span>
          </div>
        </div>
      </header>

      <section
        id="hero"
        aria-labelledby="showcase-hero-heading"
        className="relative overflow-hidden"
      >
        <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgb(255 255 255 / 88%) 0%, rgb(255 255 255 / 72%) 42%, rgb(243 243 251 / 35%) 70%, transparent 100%)",
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16 lg:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[var(--brand-600)] uppercase">
                {settings?.slogan ?? copy.appTitle}
              </p>
              <h1
                id="showcase-hero-heading"
                className="mt-2 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
              >
                {headline}
              </h1>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">{sub}</p>
              <p className="mt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Thuê với chất lượng cao — đẳng cấp từng khoảnh khắc
              </p>
              {(settings?.phone || settings?.address) && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {settings.phone ? (
                    <a
                      href={`tel:${settings.phone}`}
                      className="inline-flex items-center gap-1 font-semibold text-slate-800"
                    >
                      <Phone size={12} className="text-[var(--brand-600)]" />
                      {settings.phone}
                    </a>
                  ) : null}
                  {settings.address ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--brand-600)]" />
                      {settings.address}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div
              className="mx-auto flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-2 border-[var(--brand-300)] bg-[var(--brand-500)] px-4 text-center text-white shadow-lg sm:mx-0 sm:h-40 sm:w-40"
              aria-label={badge}
            >
              <Sparkles className="mb-1 text-[var(--brand-100)]" size={22} />
              <p className="text-[10px] leading-snug font-bold tracking-wide uppercase">
                {badge}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <section id="collection" aria-labelledby="collection-heading" className="space-y-5">
        <h2 id="collection-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
          Danh mục mẫu sẵn sàng
        </h2>
        <div className="sticky top-[3.6rem] z-20 space-y-3 rounded-[10px] border border-[var(--border)] bg-[#f0f1f4]/95 p-3 shadow-sm backdrop-blur-md sm:top-[4.25rem]">
          {(searchOpen || query) && (
            <Input
              id="showcase-search"
              className="!rounded-full border-[var(--border)] bg-white"
              placeholder={`Tìm ${copy.assetSingular}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              {filterDefs.map((def) => {
                const opts = filterOptions[def.key] ?? [];
                if (!opts.length) return null;
                const active = filters[def.key] ?? "all";
                return (
                  <label key={def.key} className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                    {def.label}
                    <select
                      className="mt-1 w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-500)]"
                      value={active}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, [def.key]: e.target.value }))
                      }
                    >
                      <option value="all">Tất cả</option>
                      {opts.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
            <label className="block text-[10px] font-bold tracking-wide text-slate-500 uppercase lg:w-48">
              Sắp xếp theo
              <select
                className="mt-1 w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--brand-500)]"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name">Tên A–Z</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-slate-500">
            {filtered.length}/{list.length} mẫu sẵn sàng
          </p>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            Không tìm thấy mẫu phù hợp.
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((g) => (
              <article
                key={g.id}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-[10px] border bg-white shadow-sm transition",
                  garmentId === g.id
                    ? "border-[var(--brand-500)]"
                    : "border-[var(--border)] hover:border-[var(--brand-300)]",
                )}
              >
                <div className="relative">
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => router.push(`/showcase/${g.id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[var(--brand-50)]">
                      {g.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.imageUrl}
                          alt={g.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-5xl">
                          {g.emoji ?? copy.emojiFallback}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={liked[g.id] ? "Bỏ yêu thích" : "Yêu thích"}
                    className={cn(
                      "absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur",
                      liked[g.id]
                        ? "text-rose-500"
                        : "text-slate-400 hover:text-rose-400",
                    )}
                    onClick={() =>
                      setLiked((m) => ({ ...m, [g.id]: !m[g.id] }))
                    }
                  >
                    <Heart
                      size={16}
                      className={liked[g.id] ? "fill-current" : undefined}
                    />
                  </button>
                </div>
                <div className="flex flex-1 flex-col space-y-1.5 p-3">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => router.push(`/showcase/${g.id}`)}
                  >
                    <h3 className="line-clamp-2 text-xs font-bold tracking-wide text-slate-900 uppercase sm:text-sm">
                      {g.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {g.size}
                      {g.color && g.color !== "—" ? ` | Màu ${g.color}` : ""}
                    </p>
                    {g.color && g.color !== "—" ? (
                      <span
                        className="mt-1.5 inline-flex h-3.5 w-3.5 rounded-full border border-[var(--border)]"
                        style={{ background: swatchColor(g.color) }}
                        title={g.color}
                      />
                    ) : null}
                    <p className="pt-2 text-sm font-bold text-slate-900">
                      {formatVnd(g.rentPrice)}
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        {priceUnit}
                      </span>
                    </p>
                  </button>
                  <div className="mt-auto flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      className="border-b border-[var(--brand-500)] pb-0.5 text-xs font-semibold text-[var(--brand-600)]"
                      onClick={() => router.push(`/showcase/${g.id}`)}
                    >
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      className="border-b border-slate-800 pb-0.5 text-xs font-semibold text-slate-900"
                      onClick={() => pickBook(g)}
                    >
                      Đặt thuê
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>

        <section
          id="trust"
          aria-labelledby="trust-heading"
          className="rounded-[10px] border border-[var(--border)] bg-[#f7f3ee] px-4 py-6 sm:px-6"
        >
          <h2 id="trust-heading" className="sr-only">
            Cam kết dịch vụ
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white text-[var(--brand-600)] shadow-sm">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-slate-900 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="book-form" aria-labelledby="form-h" className="scroll-mt-28">
          <h2 id="form-h" className="mb-3 text-xl font-bold text-slate-900">
            Đặt lịch thuê
          </h2>
          <Card className="space-y-3 p-5">
            {sent ? (
              <p className="text-sm text-emerald-700">
                Cảm ơn bạn — {settings?.name ?? "studio"} sẽ liên hệ lại (demo
                local).
              </p>
            ) : (
              <>
                {(formOpen || selected) && selected ? (
                  <p className="rounded-[10px] bg-[var(--brand-50)] px-3 py-2 text-sm">
                    Đang đặt:{" "}
                    <span className="font-semibold">{selected.name}</span> ·{" "}
                    {formatVnd(selected.rentPrice)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Chọn mẫu rồi bấm Đặt thuê, hoặc chọn trong danh sách dưới.
                  </p>
                )}
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
                  className="w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
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
                <Button className="w-full" variant="default" onClick={() => void submit()}>
                  Gửi yêu cầu đặt lịch
                </Button>
              </>
            )}
          </Card>
        </section>
      </main>

      {selected && !sent ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgb(26_35_50/8%)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selected.name}
              </p>
              <p className="text-xs text-[var(--brand-600)]">
                {formatVnd(selected.rentPrice)}
                {vertical === "thue-xe" ? "/ngày" : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
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
