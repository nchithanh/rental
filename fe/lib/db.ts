import Dexie, { type EntityTable } from "dexie";
import type {
  Customer,
  Garment,
  GarmentEvent,
  GarmentStatus,
  Meta,
  OrderStatus,
  Payment,
  RentalOrder,
  StoreSettings,
  User,
} from "@/types";
import { getVerticalCopy, readVertical } from "@/lib/vertical-core";

export function getDbName(): string {
  return `dolphin_rental_${readVertical()}`;
}

export class DolphinRentalDB extends Dexie {
  settings!: EntityTable<StoreSettings, "id">;
  users!: EntityTable<User, "id">;
  customers!: EntityTable<Customer, "id">;
  garments!: EntityTable<Garment, "id">;
  orders!: EntityTable<RentalOrder, "id">;
  payments!: EntityTable<Payment, "id">;
  garmentEvents!: EntityTable<GarmentEvent, "id">;
  meta!: EntityTable<Meta, "key">;

  constructor(name = getDbName()) {
    super(name);
    this.version(1).stores({
      settings: "id",
      users: "id, email, role, status",
      customers: "id, phone, name",
      garments: "id, code, status, category, active, name",
      orders: "id, code, customerId, status, startDate, endDate, createdAt",
      payments: "id, orderId, kind, createdAt",
      garmentEvents: "id, garmentId, orderId, createdAt",
      meta: "key",
    });
  }
}

let _db: DolphinRentalDB | null = null;
let _dbName: string | null = null;

export function getDb(): DolphinRentalDB {
  const name = getDbName();
  if (!_db || _dbName !== name) {
    _db = new DolphinRentalDB(name);
    _dbName = name;
  }
  return _db;
}

/** Proxy — mọi import `db` dùng đúng IndexedDB theo vertical hiện tại. */
export const db = new Proxy({} as DolphinRentalDB, {
  get(_target, prop, _receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export function garmentStatusLabel(status: GarmentStatus): string {
  const copy = getVerticalCopy();
  const base: Record<GarmentStatus, string> = {
    ready: "Sẵn sàng",
    booked: "Đã đặt",
    renting: "Đang cho thuê",
    awaiting_return: "Chờ trả",
    laundry: copy.laundry,
    repair: copy.repair,
  };
  return base[status];
}

/** Nhãn theo vertical hiện tại (Proxy — luôn đọc `getVerticalCopy`). */
export const GARMENT_STATUS_LABEL = new Proxy(
  {} as Record<GarmentStatus, string>,
  {
    get(_t, key: string | symbol) {
      if (typeof key !== "string") return undefined;
      return garmentStatusLabel(key as GarmentStatus);
    },
    ownKeys() {
      return [
        "ready",
        "booked",
        "renting",
        "awaiting_return",
        "laundry",
        "repair",
      ];
    },
    getOwnPropertyDescriptor(_t, key) {
      if (typeof key !== "string") return undefined;
      return {
        configurable: true,
        enumerable: true,
        value: garmentStatusLabel(key as GarmentStatus),
      };
    },
  },
);

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  scheduled: "Đặt lịch",
  confirmed: "Đã xác nhận",
  renting: "Đang thuê",
  returned: "Đã trả",
  cancelled: "Đã hủy",
};
