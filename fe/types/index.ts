export type Role = "owner" | "staff";
export type UserStatus = "active" | "inactive";

/** Trạng thái trang phục */
export type GarmentStatus =
  | "ready"
  | "booked"
  | "renting"
  | "awaiting_return"
  | "laundry"
  | "repair";

/** Trạng thái đơn thuê */
export type OrderStatus =
  | "scheduled"
  | "confirmed"
  | "renting"
  | "returned"
  | "cancelled";

export type PaymentKind =
  | "rent"
  | "deposit"
  | "fee_late"
  | "fee_damage"
  | "fee_lost"
  | "deposit_refund"
  | "other";

export type PaymentMethod = "cash" | "transfer" | "qr";

export type PermissionKey =
  | "trang-phuc"
  | "don-thue"
  | "khach-hang"
  | "thanh-toan"
  | "bao-cao"
  | "cai-dat";

export interface StoreSettings {
  id: string;
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email?: string;
  zaloNotifyEnabled?: boolean;
  websiteShowcaseTodo?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: Role;
  status: UserStatus;
  permissions: Record<PermissionKey, boolean>;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  note?: string;
  createdAt: string;
}

export interface Garment {
  id: string;
  code: string;
  name: string;
  imageUrl?: string;
  emoji?: string;
  size: string;
  color: string;
  category: string;
  rentPrice: number;
  depositDefault: number;
  status: GarmentStatus;
  note?: string;
  active: boolean;
  createdAt: string;
}

export interface RentalLine {
  garmentId: string;
  rentPrice: number;
  deposit: number;
}

export interface RentalOrder {
  id: string;
  code: string;
  customerId: string;
  /** Ngày nhận dự kiến YYYY-MM-DD */
  startDate: string;
  /** Ngày trả dự kiến YYYY-MM-DD */
  endDate: string;
  status: OrderStatus;
  lines: RentalLine[];
  rentTotal: number;
  depositTotal: number;
  feesTotal: number;
  paidRent: number;
  paidDeposit: number;
  refundedDeposit: number;
  note?: string;
  createdAt: string;
  returnedAt?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  note?: string;
  createdAt: string;
}

/** Lịch sử sự kiện trên từng bộ đồ */
export interface GarmentEvent {
  id: string;
  garmentId: string;
  orderId?: string;
  type:
    | "created"
    | "status"
    | "rented"
    | "returned"
    | "laundry"
    | "repair"
    | "damage"
    | "lost";
  note: string;
  createdAt: string;
}

export interface Meta {
  key: string;
  value: string;
}
