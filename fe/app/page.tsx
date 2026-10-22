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
import { db, GARMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from "@/lib/db";
import { orderBalance } from "@/lib/rental";
import { cn, formatVnd, todayKey } from "@/lib/utils";
import type { GarmentStatus, OrderStatus } from "@/types";

const BRAND = "#5d5cc4";
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
  const garments = useLiveQuery(() => db.garments.toArray());
  const orders = useLiveQuery(() => db.orders.toArray());
  const payments = useLiveQuery(() => db.payments.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());
  const today = todayKey();
  const [range, setRange] = useState<RangeDays>(7);
  const [aiExpanded, setAiExpanded] = useState(false);
  const AI_PREVIEW = 3;

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
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Quá hạn trả",
      value: String(overdue),
      href: "/tra-do",
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Đồ sẵn sàng",
      value: String(ready),
      href: "/trang-phuc",
      icon: PackageCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "DT tháng này",
      value: formatVnd(revenueMonth),
      href: "/bao-cao",
      icon: CircleDollarSign,
      tone: "bg-[var(--brand-50)] text-[var(--brand-700)]",
    },
    {
      label: "Cọc đang giữ",
      value: formatVnd(depositHeld),
      href: "/thanh-toan",
      icon: Wallet,
      tone: "bg-amber-50 text-amber-800",
    },
  ];

  function RangeToggle() {
    return (
      <div
        className="inline-flex rounded-full border border-slate-200 p-0.5 text-xs font-bold"
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
                : "text-slate-500 hover:bg-slate-50",
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
      <div className="mb-4 rounded-[12px] bg-[var(--banner)] px-4 py-3">
        <h1 className="text-lg font-bold">Tổng quan studio</h1>
        <p className="text-sm text-slate-600">
          Đơn thuê · trang phục · cọc · doanh thu
        </p>
      </div>

      <section className="mb-4" aria-label="Thao tác nhanh">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[
            {
              href: "/don-thue/moi",
              label: "Tạo đơn thuê",
              icon: ClipboardPlus,
              primary: true,
            },
            {
              href: "/tra-do",
              label: "Trả đồ",
              icon: PackageCheck,
              primary: false,
            },
            {
              href: "/trang-phuc",
              label: "Thêm / xem đồ",
              icon: Shirt,
              primary: false,
            },
            {
              href: "/khach-hang",
              label: "Khách hàng",
              icon: UserPlus,
              primary: false,
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href + a.label} href={a.href}>
                <Button
                  variant={a.primary ? "default" : "outline"}
                  className="h-auto w-full justify-start gap-2 rounded-[10px] px-3 py-3"
                >
                  <Icon size={18} />
                  <span className="text-sm font-semibold">{a.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href}>
              <Card className="h-full p-4 transition hover:ring-1 hover:ring-[var(--brand-300)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-[10px]",
                      k.tone,
                    )}
                  >
                    <Icon size={16} />
                  </span>
                </div>
                <p className="text-lg font-bold tabular-nums sm:text-xl">
                  {k.value}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4">
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
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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

        <Card className="p-4">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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

        <Card className="p-4">
          <h2 className="mb-1 font-bold">Đơn theo trạng thái</h2>
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

        <Card className="p-4">
          <h2 className="mb-1 font-bold">Top trang phục thuê</h2>
          <p className="mb-3 text-xs text-slate-500">Số lần xuất hiện trên đơn</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topGarments} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                  fill="#7a79d0"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
        <Card className="p-4">
          <h2 className="mb-3 font-bold">Tình trạng kho đồ</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={garmentStatusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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

        <Card className="border-[var(--brand-100)] bg-gradient-to-br from-[var(--brand-50)] to-white p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-700)]">
            <Sparkles size={16} />
            Dolphin AI
          </div>
          <p className="text-sm font-semibold text-slate-800">
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
                  className="flex w-full items-center justify-center gap-1 rounded-[10px] py-2 text-sm font-semibold text-[var(--brand-600)] hover:bg-white/60"
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
    </AppShell>
  );
}
