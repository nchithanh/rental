import { db } from "@/lib/db";
import { todayKey, uid } from "@/lib/utils";
import type {
  GarmentStatus,
  OrderStatus,
  PaymentKind,
  PaymentMethod,
  RentalLine,
  RentalOrder,
} from "@/types";
import { format as dfFormat } from "date-fns";

const ACTIVE_ORDER: OrderStatus[] = ["scheduled", "confirmed", "renting"];

/** Khoảng [start, end] trùng nhau (inclusive ngày). */
export function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export async function isGarmentAvailable(
  garmentId: string,
  startDate: string,
  endDate: string,
  excludeOrderId?: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const g = await db.garments.get(garmentId);
  if (!g || !g.active) return { ok: false, reason: "Trang phục không tồn tại" };
  if (g.status === "laundry" || g.status === "repair") {
    return { ok: false, reason: `Đang ${g.status === "laundry" ? "giặt" : "sửa"}` };
  }

  const orders = await db.orders
    .filter(
      (o) =>
        ACTIVE_ORDER.includes(o.status) &&
        o.id !== excludeOrderId &&
        o.lines.some((l) => l.garmentId === garmentId) &&
        datesOverlap(o.startDate, o.endDate, startDate, endDate),
    )
    .toArray();

  if (orders.length) {
    return {
      ok: false,
      reason: `Trùng lịch với đơn ${orders[0].code}`,
    };
  }
  return { ok: true };
}

async function nextOrderCode(): Promise<string> {
  const row = await db.meta.get("orderSeq");
  const n = Number(row?.value ?? "0") + 1;
  await db.meta.put({ key: "orderSeq", value: String(n) });
  return `TH-${dfFormat(new Date(), "yyMMdd")}-${String(n).padStart(3, "0")}`;
}

export async function createRentalOrder(input: {
  customerId: string;
  startDate: string;
  endDate: string;
  lines: RentalLine[];
  note?: string;
  status?: OrderStatus;
}): Promise<RentalOrder> {
  if (!input.lines.length) throw new Error("Chọn ít nhất một trang phục");
  if (input.startDate > input.endDate) {
    throw new Error("Ngày trả phải sau ngày nhận");
  }

  for (const line of input.lines) {
    const check = await isGarmentAvailable(
      line.garmentId,
      input.startDate,
      input.endDate,
    );
    if (!check.ok) throw new Error(check.reason);
  }

  const status = input.status ?? "scheduled";
  const rentTotal = input.lines.reduce((s, l) => s + l.rentPrice, 0);
  const depositTotal = input.lines.reduce((s, l) => s + l.deposit, 0);
  const order: RentalOrder = {
    id: uid("ord"),
    code: await nextOrderCode(),
    customerId: input.customerId,
    startDate: input.startDate,
    endDate: input.endDate,
    status,
    lines: input.lines,
    rentTotal,
    depositTotal,
    feesTotal: 0,
    paidRent: 0,
    paidDeposit: 0,
    refundedDeposit: 0,
    note: input.note,
    createdAt: new Date().toISOString(),
  };

  const garmentStatus: GarmentStatus =
    status === "renting" ? "renting" : "booked";

  await db.transaction(
    "rw",
    [db.orders, db.garments, db.garmentEvents],
    async () => {
      await db.orders.add(order);
      for (const line of input.lines) {
        await db.garments.update(line.garmentId, { status: garmentStatus });
        await db.garmentEvents.add({
          id: uid("evt"),
          garmentId: line.garmentId,
          orderId: order.id,
          type: status === "renting" ? "rented" : "status",
          note: `Đơn ${order.code} · ${status}`,
          createdAt: new Date().toISOString(),
        });
      }
    },
  );

  return order;
}

/** Đổi ngày nhận/trả — kiểm tra trùng lịch lại (trừ chính đơn này). */
export async function updateOrderDates(
  orderId: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  const order = await db.orders.get(orderId);
  if (!order) throw new Error("Không tìm thấy đơn");
  if (order.status === "returned" || order.status === "cancelled") {
    throw new Error("Đơn đã kết thúc — không đổi ngày");
  }
  if (startDate > endDate) throw new Error("Ngày trả phải sau ngày nhận");

  for (const line of order.lines) {
    const check = await isGarmentAvailable(
      line.garmentId,
      startDate,
      endDate,
      orderId,
    );
    if (!check.ok) throw new Error(check.reason);
  }

  await db.orders.update(orderId, { startDate, endDate });
  for (const line of order.lines) {
    await db.garmentEvents.add({
      id: uid("evt"),
      garmentId: line.garmentId,
      orderId,
      type: "status",
      note: `Đổi lịch đơn ${order.code}: ${startDate} → ${endDate}`,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  const order = await db.orders.get(orderId);
  if (!order) throw new Error("Không tìm thấy đơn");
  if (order.status === "returned" && status !== "returned") {
    throw new Error("Đơn đã trả — không đổi lại trạng thái");
  }
  if (order.status === "cancelled" && status !== "cancelled") {
    throw new Error("Đơn đã hủy");
  }
  if (status === "returned") {
    throw new Error("Dùng màn Trả đồ để xác nhận nhận lại");
  }

  await db.transaction(
    "rw",
    [db.orders, db.garments, db.garmentEvents],
    async () => {
      await db.orders.update(orderId, { status });

      for (const line of order.lines) {
        let gStatus: GarmentStatus | undefined;
        if (status === "cancelled") gStatus = "ready";
        if (status === "confirmed" || status === "scheduled") gStatus = "booked";
        if (status === "renting") gStatus = "renting";
        if (!gStatus) continue;
        await db.garments.update(line.garmentId, { status: gStatus });
        await db.garmentEvents.add({
          id: uid("evt"),
          garmentId: line.garmentId,
          orderId,
          type: status === "renting" ? "rented" : "status",
          note: `Đơn ${order.code} → ${status}`,
          createdAt: new Date().toISOString(),
        });
      }
    },
  );
}

export async function recordPayment(input: {
  orderId: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  note?: string;
}): Promise<void> {
  if (input.amount <= 0) throw new Error("Số tiền không hợp lệ");
  const order = await db.orders.get(input.orderId);
  if (!order) throw new Error("Không tìm thấy đơn");

  await db.transaction("rw", [db.payments, db.orders], async () => {
    await db.payments.add({
      id: uid("pay"),
      orderId: input.orderId,
      kind: input.kind,
      amount: input.amount,
      method: input.method,
      note: input.note,
      createdAt: new Date().toISOString(),
    });

    const patch: Partial<RentalOrder> = {};
    if (input.kind === "rent") patch.paidRent = order.paidRent + input.amount;
    if (input.kind === "deposit") {
      patch.paidDeposit = order.paidDeposit + input.amount;
    }
    if (input.kind === "deposit_refund") {
      patch.refundedDeposit = order.refundedDeposit + input.amount;
    }
    if (
      input.kind === "fee_late" ||
      input.kind === "fee_damage" ||
      input.kind === "fee_lost" ||
      input.kind === "other"
    ) {
      patch.feesTotal = order.feesTotal + input.amount;
    }
    await db.orders.update(input.orderId, patch);
  });
}

/** Xác nhận trả đồ + cập nhật tình trạng từng món */
export async function completeReturn(input: {
  orderId: string;
  items: {
    garmentId: string;
    condition: "ok" | "laundry" | "repair" | "damage" | "lost";
    fee?: number;
    note?: string;
  }[];
  refundDeposit?: number;
  method?: PaymentMethod;
}): Promise<void> {
  const order = await db.orders.get(input.orderId);
  if (!order) throw new Error("Không tìm thấy đơn");
  if (order.status === "returned" || order.status === "cancelled") {
    throw new Error("Đơn đã kết thúc");
  }

  await db.transaction(
    "rw",
    [db.orders, db.garments, db.garmentEvents, db.payments],
    async () => {
      let fees = order.feesTotal;
      for (const item of input.items) {
        const statusMap = {
          ok: "ready" as const,
          laundry: "laundry" as const,
          repair: "repair" as const,
          damage: "repair" as const,
          lost: "repair" as const,
        };
        const gStatus = statusMap[item.condition];
        await db.garments.update(item.garmentId, { status: gStatus });
        await db.garmentEvents.add({
          id: uid("evt"),
          garmentId: item.garmentId,
          orderId: input.orderId,
          type:
            item.condition === "ok"
              ? "returned"
              : item.condition === "laundry"
                ? "laundry"
                : item.condition === "lost"
                  ? "lost"
                  : "damage",
          note: item.note ?? `Trả · ${item.condition}`,
          createdAt: new Date().toISOString(),
        });
        if (item.fee && item.fee > 0) {
          fees += item.fee;
          await db.payments.add({
            id: uid("pay"),
            orderId: input.orderId,
            kind:
              item.condition === "lost"
                ? "fee_lost"
                : item.condition === "ok"
                  ? "other"
                  : "fee_damage",
            amount: item.fee,
            method: input.method ?? "cash",
            note: item.note,
            createdAt: new Date().toISOString(),
          });
        }
      }

      let refunded = order.refundedDeposit;
      if (input.refundDeposit && input.refundDeposit > 0) {
        refunded += input.refundDeposit;
        await db.payments.add({
          id: uid("pay"),
          orderId: input.orderId,
          kind: "deposit_refund",
          amount: input.refundDeposit,
          method: input.method ?? "cash",
          createdAt: new Date().toISOString(),
        });
      }

      await db.orders.update(input.orderId, {
        status: "returned",
        returnedAt: new Date().toISOString(),
        feesTotal: fees,
        refundedDeposit: refunded,
      });
    },
  );
}

export function orderBalance(order: RentalOrder) {
  const dueRent = Math.max(0, order.rentTotal + order.feesTotal - order.paidRent);
  const depositHeld = Math.max(
    0,
    order.paidDeposit - order.refundedDeposit,
  );
  const overdue =
    order.status !== "returned" &&
    order.status !== "cancelled" &&
    order.endDate < todayKey();
  return { dueRent, depositHeld, overdue };
}
