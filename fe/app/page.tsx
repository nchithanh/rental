"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  CircleDollarSign,
  ClipboardPlus,
  PackageCheck,
  Shirt,
  Sparkles,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { differenceInCalendarDays, format as dfFormat, parseISO, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { db, GARMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderStatusTone } from "@/lib/labels";
import { orderBalance } from "@/lib/rental";
import { cn, formatVnd, todayKey } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { GarmentStatus, OrderStatus } from "@/types";

const BRAND = "#5d5cc4";
const GOLD = "#7a79d0";
const PIE_COLORS = ["#5d5cc4", "#7a79d0", "#9b9adc", "#34d399", "#fbbf24", "#f87171"];

function isRevenueKind(kind: string) {
  return (
    kind === "rent" ||
    kind === "fee_late" ||
    kind === "fee_damage" ||
    kind === "fee_lost" ||
    kind === "other"
  );
}

type RangeDays = 7 | 30;

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const garments = useLiveQuery(() => db.garments.toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const today = todayKey();
  const [range, setRange] = useState<RangeDays>(7);
  const [aiExpanded, setAiExpanded] = useState(false);
  const AI_PREVIEW = 3;

  const recentOrders = useMemo(() => {
    return [...(orders ?? [])]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
  }, [orders]);

  const cusName = (id: string) =>
    customers?.find((c) => c.id === id)?.name ?? "Khách";

  const renting = orders?.filter((o) => o.status === "renting").length ?? 0;
  const overdue = orders?.filter((o) => orderBalance(o).overdue).length ?? 0;
  const ready =
    garments?.filter((g) => g.status === "ready" && g.active).length ?? 0;
  const revenueMonth =
    payments
      ?.filter(
        (p) =>
          isRevenueKind(p.kind) && p.createdAt.startsWith(today.slice(0, 7)),
      )
      .reduce((s, p) => s + p.amount, 0) ?? 0;
  const depositHeld =
    orders?.reduce((s, o) => s + orderBalance(o).depositHeld, 0) ?? 0;

  const series = useMemo(() => {
    const days = Array.from({ length: range }, (_, i) => {
      const d = subDays(parseISO(`${today}T12:00:00`), range - 1 - i);
      const key = dfFormat(d, "yyyy-MM-dd");
      return {
        key,
        label:
          range === 30
            ? dfFormat(d, "d/M", { locale: vi })
            : dfFormat(d, "dd/MM", { locale: vi }),
        revenue: 0,
        orders: 0,
      };
    });
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const p of payments ?? []) {
      if (!isRevenueKind(p.kind)) continue;
      const key = p.createdAt.slice(0, 10);
      const row = byKey.get(key);
      if (row) row.revenue += p.amount;
    }
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      const key = o.createdAt.slice(0, 10);
      const row = byKey.get(key);
      if (row) row.orders += 1;
    }
    return days;
  }, [payments, orders, today, range]);

  const orderStatusChart = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      scheduled: 0,
      confirmed: 0,
      renting: 0,
      returned: 0,
      cancelled: 0,
    };
    for (const o of orders ?? []) counts[o.status] += 1;
    return (Object.keys(counts) as OrderStatus[])
      .map((k) => ({
        name: ORDER_STATUS_LABEL[k],
        key: k,
        value: counts[k],
      }))
      .filter((x) => x.value > 0);
  }, [orders]);

  const garmentStatusChart = useMemo(() => {
    const counts: Partial<Record<GarmentStatus, number>> = {};
    for (const g of garments ?? []) {
      if (!g.active) continue;
      counts[g.status] = (counts[g.status] ?? 0) + 1;
    }
    return (Object.keys(counts) as GarmentStatus[]).map((k) => ({
      name: GARMENT_STATUS_LABEL[k],
      value: counts[k] ?? 0,
    }));
  }, [garments]);

  const topGarments = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      for (const l of o.lines) {
        m.set(l.garmentId, (m.get(l.garmentId) ?? 0) + 1);
      }
    }
    const nameOf = (id: string) => {
      const g = garments?.find((x) => x.id === id);
      return g ? `${g.code}` : id;
    };
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, n]) => ({ name: nameOf(id), count: n }));
  }, [orders, garments]);

  const aiHints = useMemo(() => {
    const items: {
      id: string;
      title: string;
      detail: string;
      href: string;
      phone?: string;
    }[] = [];

    for (const o of orders ?? []) {
      if (!orderBalance(o).overdue) continue;
      const c = customers?.find((x) => x.id === o.customerId);
      items.push({
        id: `overdue-${o.id}`,
        title: `Đơn ${o.code} quá hạn trả`,
        detail: `${c?.name ?? "Khách"} · hạn ${o.endDate}`,
        href: `/tra-do?order=${o.id}`,
        phone: c?.phone,
      });
    }

    for (const c of customers ?? []) {
      const theirs = (orders ?? [])
        .filter((o) => o.customerId === c.id && o.status !== "cancelled")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (!theirs.length) continue;
      const last = theirs[0];
      const days = differenceInCalendarDays(
        parseISO(`${today}T12:00:00`),
        parseISO(last.createdAt),
      );
      if (days >= 20) {
        items.push({
          id: `dormant-${c.id}`,
          title: `${c.name} lâu chưa thuê`,
          detail: `Cách ${days} ngày · đơn cuối ${last.code}`,
          href: `/khach-hang/${c.id}`,
          phone: c.phone,
        });
      }
    }

    for (const g of garments ?? []) {
      if (g.status !== "laundry" && g.status !== "repair") continue;
      items.push({
        id: `care-${g.id}`,
        title: `${g.code} đang ${GARMENT_STATUS_LABEL[g.status].toLowerCase()}`,
        detail: g.name,
        href: `/trang-phuc/${g.id}`,
      });
    }

    return items.slice(0, 12);
  }, [orders, customers, garments, today]);

  const aiPreview = aiHints.slice(0, AI_PREVIEW);
  const aiRest = aiHints.slice(AI_PREVIEW);

  const kpis = [
    {
      label: "Đang thuê",
      value: String(renting),
      href: "/don-thue",
      icon: Shirt,
      tone: "bg-[var(--brand-50)] text-slate-900",
      trend: "+2 tuần này",
    },
    {
      label: "Quá hạn",
      value: String(overdue),
      href: "/tra-do",
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
      trend: overdue ? "Cần xử lý" : "Ổn định",
    },
    {
      label: "Đồ sẵn sàng",
      value: String(ready),
      href: "/trang-phuc",
      icon: PackageCheck,
      tone: "bg-emerald-50 text-emerald-700",
      trend: "Kho sẵn",
    },
    {
      label: "Doanh thu tháng",
      value: formatVnd(revenueMonth),
      href: "/bao-cao",
      icon: CircleDollarSign,
      tone: "bg-[var(--brand-50)] text-slate-900",
      trend: "Tháng này",
    },
    {
      label: "Cọc đang giữ",
      value: formatVnd(depositHeld),
      href: "/thanh-toan",
      icon: Wallet,
      tone: "bg-amber-50 text-amber-800",
      trend: "Đang giữ",
    },
  ];

  function RangeToggle() {
    return (
      <div
        className="inline-flex rounded-full border border-[var(--border)] bg-white p-0.5 text-xs font-semibold"
        role="group"
        aria-label="Khoảng thời gian biểu đồ"
      >
        {([7, 30] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setRange(d)}
            className={cn(
              "rounded-full px-2.5 py-1",
              range === d
                ? "bg-[var(--brand-500)] text-white"
                : "text-slate-500 hover:bg-[var(--brand-50)]",
            )}
          >
            {d} ngày
          </button>
        ))}
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`Xin chào, ${user?.name?.split(" ").slice(-1)[0] ?? "bạn"}`}
        description="Đơn thuê · trang phục · cọc · vận hành trong ngày"
        actions={
          <section
            className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
            aria-label="Thao tác nhanh"
          >
            {[
              {
                href: "/don-thue/moi",
                label: "Tạo đơn",
                icon: ClipboardPlus,
                primary: true as const,
              },
              {
                href: "/tra-do",
                label: "Trả đồ",
                icon: PackageCheck,
                primary: false as const,
              },
              {
                href: "/trang-phuc",
                label: "Kho đồ",
                icon: Shirt,
                primary: false as const,
              },
              {
                href: "/khach-hang",
                label: "Khách",
                icon: UserPlus,
                primary: false as const,
              },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.href + a.label} href={a.href}>
                  <Button
                    variant={a.primary ? "default" : "outline"}
                    size="sm"
                    className="h-auto w-full justify-center gap-1.5 px-3 py-2.5 lg:min-w-[7.5rem]"
                  >
                    <Icon
                      size={16}
                      className={a.primary ? "text-white/90" : undefined}
                    />
                    <span className="text-xs font-semibold sm:text-sm">
                      {a.label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </section>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href}>
              <div className="studio-kpi h-full p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-500">{k.label}</p>
                    <p className="mt-1 break-words text-lg font-bold leading-snug tabular-nums sm:text-xl">
                      {k.value}
                    </p>
                    <p className="mt-1 text-xs text-[var(--brand-600)]">
                      {k.trend}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                      k.tone,
                    )}
                  >
                    <Icon size={18} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold">Doanh thu</h2>
              <p className="text-xs text-slate-500">
                Thuê + phí (không gồm cọc)
              </p>
            </div>
            <RangeToggle />
          </div>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={range === 30 ? 4 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={48}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}tr`
                      : `${Math.round(v / 1000)}k`
                  }
                />
                <Tooltip
                  formatter={(v: number) => [formatVnd(v), "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={BRAND}
                  fill="url(#revFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold">Số đơn tạo</h2>
              <p className="text-xs text-slate-500">Theo ngày tạo đơn</p>
            </div>
            <RangeToggle />
          </div>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={range === 30 ? 4 : 0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  name="Đơn"
                  fill={BRAND}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 font-bold">
            Đơn theo trạng thái
          </h2>
          <p className="mb-3 text-xs text-slate-500">Toàn bộ đơn trong hệ thống</p>
          <div className="flex h-52 items-center gap-2">
            <div className="h-full min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {orderStatusChart.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-28 shrink-0 space-y-1 text-[11px]">
              {orderStatusChart.map((x, i) => (
                <li key={x.key} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate text-slate-600">{x.name}</span>
                  <span className="ml-auto font-bold">{x.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 font-bold">
            Top trang phục thuê
          </h2>
          <p className="mb-3 text-xs text-slate-500">Số lần xuất hiện trên đơn</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topGarments} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={56}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Lần"
                  fill={GOLD}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
        <Card className="p-5">
          <h2 className="mb-3 font-bold">
            Tình trạng kho đồ
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={garmentStatusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Số món"
                  fill="#34d399"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-[var(--brand-100)] bg-gradient-to-br from-[var(--brand-50)] to-white p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles size={16} className="text-[var(--brand-600)]" />
            Dolphin AI
          </div>
          <p className="text-sm font-semibold text-slate-900">
            Gợi ý vận hành — quá hạn, khách ngủ đông, đồ đang chăm sóc
          </p>
          {aiHints.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              Chưa có gợi ý nổi bật lúc này.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <ul className="space-y-2">
                {aiPreview.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-[10px] border border-[var(--border)] bg-white/95 p-3 text-sm shadow-sm"
                  >
                    <p className="font-semibold text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={a.href}>
                        <Button size="sm">Xử lý</Button>
                      </Link>
                      {a.phone ? (
                        <a
                          href={`https://zalo.me/${a.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            Zalo
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <AnimatePresence initial={false}>
                {aiExpanded && aiRest.length > 0 ? (
                  <motion.ul
                    key="ai-rest"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-2 overflow-hidden"
                  >
                    {aiRest.map((a, i) => (
                      <motion.li
                        key={a.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        className="rounded-[10px] bg-white/90 p-3 text-sm shadow-sm"
                      >
                        <p className="font-semibold">{a.title}</p>
                        <p className="text-xs text-slate-500">{a.detail}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Link href={a.href}>
                            <Button size="sm">Xử lý</Button>
                          </Link>
                          {a.phone ? (
                            <a
                              href={`https://zalo.me/${a.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                Zalo
                              </Button>
                            </a>
                          ) : null}
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>

              {aiRest.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setAiExpanded((v) => !v)}
                  className="flex w-full items-center justify-center gap-1 rounded-[10px] py-2 text-sm font-semibold text-slate-900 hover:bg-white/70"
                >
                  {aiExpanded
                    ? "Thu gọn"
                    : `Xem thêm ${aiRest.length} gợi ý`}
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform duration-200",
                      aiExpanded && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      <section aria-labelledby="recent-orders-h" className="mb-2">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <h2
              id="recent-orders-h"
              className="font-bold"
            >
              Đơn gần đây
            </h2>
            <p className="text-xs text-slate-500">
              Trạng thái · khách · khoảng ngày
            </p>
          </div>
          <Link
            href="/don-thue"
            className="text-xs font-semibold text-[var(--brand-600)] underline-offset-4 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.1fr_1fr_1fr_auto_auto] gap-3 border-b border-[var(--border)] bg-[var(--banner)]/60 px-4 py-2.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:grid">
            <span>Mã đơn</span>
            <span>Khách</span>
            <span>Ngày thuê</span>
            <span>Tổng</span>
            <span>Trạng thái</span>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Chưa có đơn.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentOrders.map((o) => {
                const bal = orderBalance(o);
                return (
                  <li key={o.id}>
                    <Link
                      href={`/don-thue/${o.id}`}
                      className="grid gap-1 px-4 py-3 transition hover:bg-[var(--brand-50)]/50 sm:grid-cols-[1.1fr_1fr_1fr_auto_auto] sm:items-center sm:gap-3"
                    >
                      <span className="font-semibold text-slate-900">
                        {o.code}
                      </span>
                      <span className="text-sm text-slate-600">
                        {cusName(o.customerId)}
                      </span>
                      <span className="text-xs text-slate-500 sm:text-sm">
                        {o.startDate} → {o.endDate}
                      </span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatVnd(o.rentTotal)}
                      </span>
                      <span
                        className={cn(
                          "w-fit rounded-full px-2.5 py-1 text-[10px] font-bold",
                          bal.overdue
                            ? "bg-rose-50 text-rose-600"
                            : orderStatusTone(o.status),
                        )}
                      >
                        {bal.overdue ? "Quá hạn" : ORDER_STATUS_LABEL[o.status]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </AppShell>
  );
}
