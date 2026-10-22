import type { GarmentStatus, OrderStatus, PaymentKind } from "@/types";

export const PAYMENT_KIND_LABEL: Record<PaymentKind, string> = {
  rent: "Tiền thuê",
  deposit: "Tiền cọc",
  fee_late: "Phí trả trễ",
  fee_damage: "Phí hư hỏng",
  fee_lost: "Phí mất đồ",
  deposit_refund: "Hoàn cọc",
  other: "Khác",
};

export const PAYMENT_METHOD_LABEL = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR",
} as const;

export function garmentStatusTone(status: GarmentStatus): string {
  switch (status) {
    case "ready":
      return "bg-emerald-50 text-emerald-700";
    case "booked":
      return "bg-sky-50 text-sky-700";
    case "renting":
      return "bg-[var(--brand-50)] text-[var(--brand-700)]";
    case "awaiting_return":
      return "bg-amber-50 text-amber-800";
    case "laundry":
      return "bg-violet-50 text-violet-700";
    case "repair":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function orderStatusTone(status: OrderStatus): string {
  switch (status) {
    case "scheduled":
      return "bg-slate-100 text-slate-700";
    case "confirmed":
      return "bg-sky-50 text-sky-700";
    case "renting":
      return "bg-[var(--brand-50)] text-[var(--brand-700)]";
    case "returned":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
