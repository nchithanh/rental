import { db } from "@/lib/db";
import { buildSeedGarments } from "@/lib/seed-garments";
import { buildSeedVehicles } from "@/lib/seed-vehicles";
import { readVertical } from "@/lib/vertical-core";
import type {
  Customer,
  GarmentEvent,
  GarmentStatus,
  OrderStatus,
  Payment,
  PaymentKind,
  PaymentMethod,
  RentalOrder,
  StoreSettings,
  User,
} from "@/types";

/** Bump để force re-seed demo khi đổi data. */
export const SEED_VERSION = "4";

const ALL_PERMS = {
  "trang-phuc": true,
  "don-thue": true,
  "khach-hang": true,
  "thanh-toan": true,
  "bao-cao": true,
  "cai-dat": true,
} as const;

function pay(
  id: string,
  orderId: string,
  kind: PaymentKind,
  amount: number,
  method: PaymentMethod,
  createdAt: string,
  note?: string,
): Payment {
  return { id, orderId, kind, amount, method, createdAt, note };
}

export async function ensureSeeded(): Promise<void> {
  const meta = await db.meta.get("seeded");
  if (meta?.value === SEED_VERSION) return;

  await db.transaction(
    "rw",
    [
      db.settings,
      db.users,
      db.customers,
      db.garments,
      db.orders,
      db.payments,
      db.garmentEvents,
      db.meta,
    ],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.users.clear(),
        db.customers.clear(),
        db.garments.clear(),
        db.orders.clear(),
        db.payments.clear(),
        db.garmentEvents.clear(),
        db.meta.clear(),
      ]);
    },
  );

  const vertical = readVertical();
  const isXe = vertical === "thue-xe";

  const settings: StoreSettings = {
    id: "store",
    name: isXe ? "Dolphin Thuê Xe" : "Dolphin Studio Thuê",
    slogan: isXe
      ? "Cho thuê xe — nhận · trả · cọc & bảo hiểm rõ"
      : "Cho thuê trang phục — nhận · trả · cọc rõ ràng",
    address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "0901234567",
    zaloNotifyEnabled: false,
    websiteShowcaseTodo: true,
  };

  const users: User[] = [
    {
      id: "u_owner",
      name: isXe ? "Chủ gara / cửa hàng" : "Chủ studio",
      email: "owner@studio.local",
      pin: "0000",
      role: "owner",
      status: "active",
      permissions: { ...ALL_PERMS },
    },
    {
      id: "u_staff",
      name: "Nhân viên",
      email: "staff@studio.local",
      pin: "1111",
      role: "staff",
      status: "active",
      permissions: { ...ALL_PERMS },
    },
  ];

  const customers: Customer[] = isXe
    ? [
        { id: "c1", name: "Nguyễn Minh Anh", phone: "0901111222", note: "Hay thuê sedan đi tỉnh", createdAt: "2026-08-01T08:00:00.000Z" },
        { id: "c2", name: "Trần Bảo Ngọc", phone: "0903333444", createdAt: "2026-08-05T08:00:00.000Z" },
        { id: "c3", name: "Lê Hoàng Nam", phone: "0905555666", note: "Thuê bán tải chở hàng", createdAt: "2026-08-10T08:00:00.000Z" },
        { id: "c4", name: "Phạm Thu Hà", phone: "0912222333", note: "MPV đưa đón gia đình", createdAt: "2026-08-12T08:00:00.000Z" },
        { id: "c5", name: "Võ Gia Bảo", phone: "0987654321", createdAt: "2026-08-15T08:00:00.000Z" },
        { id: "c6", name: "Đặng Khánh Linh", phone: "0934567890", note: "Khách VIP · Camry", createdAt: "2026-08-20T08:00:00.000Z" },
        { id: "c7", name: "Hoàng Mỹ Duyên", phone: "0971111222", createdAt: "2026-09-01T08:00:00.000Z" },
        { id: "c8", name: "Ngô Quang Huy", phone: "0968888999", createdAt: "2026-09-05T08:00:00.000Z" },
        { id: "c9", name: "Bùi Thanh Trúc", phone: "0943333444", createdAt: "2026-09-12T08:00:00.000Z" },
        { id: "c10", name: "Lý Anh Thư", phone: "0925555666", note: "Xe máy ngày cuối tuần", createdAt: "2026-09-18T08:00:00.000Z" },
      ]
    : [
        { id: "c1", name: "Nguyễn Minh Anh", phone: "0901111222", note: "Hay thuê váy dự tiệc", createdAt: "2026-08-01T08:00:00.000Z" },
        { id: "c2", name: "Trần Bảo Ngọc", phone: "0903333444", createdAt: "2026-08-05T08:00:00.000Z" },
        { id: "c3", name: "Lê Hoàng Nam", phone: "0905555666", note: "Thuê set / vest", createdAt: "2026-08-10T08:00:00.000Z" },
        { id: "c4", name: "Phạm Thu Hà", phone: "0912222333", note: "Áo dài · cocktail", createdAt: "2026-08-12T08:00:00.000Z" },
        { id: "c5", name: "Võ Gia Bảo", phone: "0987654321", createdAt: "2026-08-15T08:00:00.000Z" },
        { id: "c6", name: "Đặng Khánh Linh", phone: "0934567890", note: "Khách VIP", createdAt: "2026-08-20T08:00:00.000Z" },
        { id: "c7", name: "Hoàng Mỹ Duyên", phone: "0971111222", createdAt: "2026-09-01T08:00:00.000Z" },
        { id: "c8", name: "Ngô Quang Huy", phone: "0968888999", createdAt: "2026-09-05T08:00:00.000Z" },
        { id: "c9", name: "Bùi Thanh Trúc", phone: "0943333444", createdAt: "2026-09-12T08:00:00.000Z" },
        { id: "c10", name: "Lý Anh Thư", phone: "0925555666", note: "Sinh nhật · cocktail", createdAt: "2026-09-18T08:00:00.000Z" },
      ];

  const garments = isXe ? buildSeedVehicles() : buildSeedGarments();
  const byId = Object.fromEntries(garments.map((x) => [x.id, x]));
  const line = (garmentId: string) => {
    const g = byId[garmentId];
    if (!g) throw new Error(`Missing garment ${garmentId}`);
    return {
      garmentId,
      rentPrice: g.rentPrice,
      deposit: g.depositDefault,
    };
  };

  const ord = (
    id: string,
    code: string,
    customerId: string,
    startDate: string,
    endDate: string,
    status: OrderStatus,
    garmentIds: string[],
    paidRent: number,
    paidDeposit: number,
    refundedDeposit: number,
    feesTotal: number,
    createdAt: string,
    note?: string,
    returnedAt?: string,
  ): RentalOrder => {
    const lines = garmentIds.map(line);
    return {
      id,
      code,
      customerId,
      startDate,
      endDate,
      status,
      lines,
      rentTotal: lines.reduce((s, l) => s + l.rentPrice, 0),
      depositTotal: lines.reduce((s, l) => s + l.deposit, 0),
      feesTotal,
      paidRent,
      paidDeposit,
      refundedDeposit,
      createdAt,
      note,
      returnedAt,
    };
  };

  const orders: RentalOrder[] = isXe
    ? [
        ord("o1", "TH-221001-001", "c1", "2026-10-20", "2026-10-22", "renting", ["g2"], 0, 0, 0, 0, "2026-10-18T09:00:00.000Z"),
        ord("o2", "TH-221005-002", "c3", "2026-10-25", "2026-10-27", "confirmed", ["g7"], 0, 0, 0, 0, "2026-10-19T10:00:00.000Z"),
        ord("o3", "TH-220915-003", "c2", "2026-09-15", "2026-09-17", "returned", ["g1"], 0, 0, 0, 100_000, "2026-09-10T08:00:00.000Z", "Phí vệ sinh xe", "2026-09-17T16:00:00.000Z"),
        ord("o4", "TH-220920-004", "c4", "2026-09-20", "2026-09-22", "returned", ["g5"], 0, 0, 0, 0, "2026-09-18T08:00:00.000Z", undefined, "2026-09-22T15:00:00.000Z"),
        ord("o5", "TH-220928-005", "c6", "2026-09-28", "2026-09-30", "returned", ["g13"], 0, 0, 0, 150_000, "2026-09-25T09:00:00.000Z", "Phí trễ 1 ngày", "2026-10-01T10:00:00.000Z"),
        ord("o6", "TH-221008-006", "c5", "2026-10-08", "2026-10-10", "returned", ["g6"], 0, 0, 0, 0, "2026-10-05T08:00:00.000Z", undefined, "2026-10-10T18:00:00.000Z"),
        ord("o7", "TH-221012-007", "c7", "2026-10-12", "2026-10-14", "returned", ["g11", "g12"], 0, 0, 0, 0, "2026-10-10T08:00:00.000Z", undefined, "2026-10-14T17:00:00.000Z"),
        ord("o8", "TH-221015-008", "c8", "2026-10-15", "2026-10-17", "renting", ["g3"], 0, 0, 0, 0, "2026-10-13T09:00:00.000Z"),
        ord("o9", "TH-221016-009", "c9", "2026-10-16", "2026-10-18", "renting", ["g8"], 0, 0, 0, 0, "2026-10-14T10:00:00.000Z", "Chờ kiểm tra khi trả"),
        ord("o10", "TH-221018-010", "c10", "2026-10-18", "2026-10-19", "returned", ["g4"], 0, 0, 0, 0, "2026-10-16T08:00:00.000Z", undefined, "2026-10-19T20:00:00.000Z"),
        ord("o11", "TH-221022-011", "c6", "2026-10-28", "2026-10-30", "scheduled", ["g14"], 0, 0, 0, 0, "2026-10-20T11:00:00.000Z", "Cọc một phần"),
        ord("o12", "TH-221023-012", "c2", "2026-10-26", "2026-10-27", "confirmed", ["g9"], 0, 0, 0, 0, "2026-10-21T09:00:00.000Z"),
        ord("o13", "TH-221024-013", "c1", "2026-11-01", "2026-11-03", "scheduled", ["g15"], 0, 0, 0, 0, "2026-10-22T08:00:00.000Z"),
        ord("o14", "TH-221010-014", "c4", "2026-10-10", "2026-10-12", "cancelled", ["g10"], 0, 200_000, 200_000, 0, "2026-10-08T08:00:00.000Z", "Khách hủy — hoàn cọc"),
        ord("o15", "TH-221005-015", "c5", "2026-10-05", "2026-10-07", "renting", ["g13"], 0, 0, 0, 0, "2026-10-03T08:00:00.000Z", "Quá hạn — chưa trả"),
      ]
    : [
        ord("o1", "TH-221001-001", "c1", "2026-10-20", "2026-10-22", "renting", ["g2", "g15"], 1_150_000, 1_450_000, 0, 0, "2026-10-18T09:00:00.000Z"),
        ord("o2", "TH-221005-002", "c3", "2026-10-25", "2026-10-27", "confirmed", ["g17"], 0, 500_000, 0, 0, "2026-10-19T10:00:00.000Z"),
        ord("o3", "TH-220915-003", "c2", "2026-09-15", "2026-09-17", "returned", ["g1"], 800_000, 1_000_000, 900_000, 100_000, "2026-09-10T08:00:00.000Z", "Phí làm sạch nhẹ", "2026-09-17T16:00:00.000Z"),
        ord("o4", "TH-220920-004", "c4", "2026-09-20", "2026-09-22", "returned", ["g6", "g16"], 1_000_000, 1_350_000, 1_350_000, 0, "2026-09-18T08:00:00.000Z", undefined, "2026-09-22T15:00:00.000Z"),
        ord("o5", "TH-220928-005", "c6", "2026-09-28", "2026-09-30", "returned", ["g7"], 900_000, 1_150_000, 1_000_000, 150_000, "2026-09-25T09:00:00.000Z", "Phí trễ 1 ngày", "2026-10-01T10:00:00.000Z"),
        ord("o6", "TH-221008-006", "c5", "2026-10-08", "2026-10-10", "returned", ["g8"], 500_000, 650_000, 650_000, 0, "2026-10-05T08:00:00.000Z", undefined, "2026-10-10T18:00:00.000Z"),
        ord("o7", "TH-221012-007", "c7", "2026-10-12", "2026-10-14", "returned", ["g10", "g22"], 400_000, 550_000, 550_000, 0, "2026-10-10T08:00:00.000Z", undefined, "2026-10-14T17:00:00.000Z"),
        ord("o8", "TH-221015-008", "c8", "2026-10-15", "2026-10-17", "renting", ["g20"], 450_000, 550_000, 0, 0, "2026-10-13T09:00:00.000Z"),
        ord("o9", "TH-221016-009", "c9", "2026-10-16", "2026-10-18", "renting", ["g21"], 500_000, 650_000, 0, 0, "2026-10-14T10:00:00.000Z", "Chờ kiểm tra khi trả"),
        ord("o10", "TH-221018-010", "c10", "2026-10-18", "2026-10-19", "returned", ["g3"], 550_000, 700_000, 700_000, 0, "2026-10-16T08:00:00.000Z", undefined, "2026-10-19T20:00:00.000Z"),
        ord("o11", "TH-221022-011", "c6", "2026-10-28", "2026-10-30", "scheduled", ["g1", "g16"], 0, 800_000, 0, 0, "2026-10-20T11:00:00.000Z", "Cọc một phần"),
        ord("o12", "TH-221023-012", "c2", "2026-10-26", "2026-10-27", "confirmed", ["g14"], 0, 400_000, 0, 0, "2026-10-21T09:00:00.000Z"),
        ord("o13", "TH-221024-013", "c1", "2026-11-01", "2026-11-03", "scheduled", ["g4", "g9"], 0, 0, 0, 0, "2026-10-22T08:00:00.000Z"),
        ord("o14", "TH-221010-014", "c4", "2026-10-10", "2026-10-12", "cancelled", ["g19"], 0, 200_000, 200_000, 0, "2026-10-08T08:00:00.000Z", "Khách hủy — hoàn cọc"),
        ord("o15", "TH-221005-015", "c5", "2026-10-05", "2026-10-07", "renting", ["g26"], 500_000, 650_000, 0, 0, "2026-10-03T08:00:00.000Z", "Quá hạn — chưa trả"),
      ];

  // Align paid / refund totals to line totals
  for (const o of orders) {
    if (["o1", "o8", "o9", "o15"].includes(o.id)) {
      o.paidRent = o.rentTotal;
      o.paidDeposit = o.depositTotal;
    }
    if (["o3", "o4", "o5", "o6", "o7", "o10"].includes(o.id)) {
      o.paidRent = o.rentTotal;
      o.paidDeposit = o.depositTotal;
      if (o.id === "o3") o.refundedDeposit = o.depositTotal - 100_000;
      else if (o.id === "o5") o.refundedDeposit = o.depositTotal - 150_000;
      else o.refundedDeposit = o.depositTotal;
    }
    if (o.id === "o2" || o.id === "o12") {
      o.paidDeposit = o.depositTotal;
      o.paidRent = 0;
    }
    if (o.id === "o11") {
      o.paidDeposit = Math.round((o.depositTotal * 0.5) / 50_000) * 50_000;
      o.paidRent = 0;
    }
  }

  const statusByGarment = new Map<string, GarmentStatus>();
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "returned") continue;
    const gs: GarmentStatus =
      o.status === "renting" ? "renting" : "booked";
    for (const l of o.lines) statusByGarment.set(l.garmentId, gs);
  }
  for (const garment of garments) {
    const forced = statusByGarment.get(garment.id);
    if (forced) garment.status = forced;
  }
  // Một vài món đang xử lý kho / bảo dưỡng (không đụng đơn active)
  if (isXe) {
    const laundry = garments.find((x) => x.id === "g11");
    if (laundry) laundry.status = "laundry";
    const repair = garments.find((x) => x.id === "g10");
    if (repair) {
      repair.status = "repair";
      repair.note = "Sửa phanh / bảo dưỡng";
    }
  } else {
    const laundry = garments.find((x) => x.id === "g12");
    if (laundry) laundry.status = "laundry";
    const repair = garments.find((x) => x.id === "g18");
    if (repair) {
      repair.status = "repair";
      repair.note = "Sửa đường may";
    }
    const laundry2 = garments.find((x) => x.id === "g30");
    if (laundry2) laundry2.status = "laundry";
  }

  const payments: Payment[] = [
    pay("p1", "o1", "deposit", orders[0].paidDeposit, "transfer", "2026-10-18T09:05:00.000Z"),
    pay("p2", "o1", "rent", orders[0].paidRent, "cash", "2026-10-20T08:00:00.000Z"),
    pay("p3", "o2", "deposit", orders[1].paidDeposit, "qr", "2026-10-19T10:05:00.000Z"),
    pay("p4", "o3", "rent", orders[2].rentTotal, "cash", "2026-09-15T09:00:00.000Z"),
    pay("p5", "o3", "deposit", orders[2].depositTotal, "cash", "2026-09-15T09:01:00.000Z"),
    pay("p6", "o3", "fee_damage", 100_000, "cash", "2026-09-17T16:00:00.000Z", "Làm sạch"),
    pay("p7", "o3", "deposit_refund", orders[2].refundedDeposit, "cash", "2026-09-17T16:05:00.000Z"),
    pay("p8", "o4", "deposit", orders[3].depositTotal, "transfer", "2026-09-18T08:30:00.000Z"),
    pay("p9", "o4", "rent", orders[3].rentTotal, "transfer", "2026-09-20T09:00:00.000Z"),
    pay("p10", "o4", "deposit_refund", orders[3].refundedDeposit, "transfer", "2026-09-22T15:10:00.000Z"),
    pay("p11", "o5", "deposit", orders[4].depositTotal, "qr", "2026-09-25T09:10:00.000Z"),
    pay("p12", "o5", "rent", orders[4].rentTotal, "cash", "2026-09-28T08:00:00.000Z"),
    pay("p13", "o5", "fee_late", 150_000, "cash", "2026-10-01T10:00:00.000Z"),
    pay("p14", "o5", "deposit_refund", orders[4].refundedDeposit, "cash", "2026-10-01T10:05:00.000Z"),
    pay("p15", "o6", "deposit", orders[5].depositTotal, "transfer", "2026-10-05T08:20:00.000Z"),
    pay("p16", "o6", "rent", orders[5].rentTotal, "transfer", "2026-10-08T09:00:00.000Z"),
    pay("p17", "o6", "deposit_refund", orders[5].refundedDeposit, "transfer", "2026-10-10T18:10:00.000Z"),
    pay("p18", "o7", "deposit", orders[6].depositTotal, "cash", "2026-10-10T08:30:00.000Z"),
    pay("p19", "o7", "rent", orders[6].rentTotal, "qr", "2026-10-12T09:00:00.000Z"),
    pay("p20", "o7", "deposit_refund", orders[6].refundedDeposit, "cash", "2026-10-14T17:10:00.000Z"),
    pay("p21", "o8", "deposit", orders[7].paidDeposit, "transfer", "2026-10-13T09:10:00.000Z"),
    pay("p22", "o8", "rent", orders[7].paidRent, "cash", "2026-10-15T08:00:00.000Z"),
    pay("p23", "o9", "deposit", orders[8].paidDeposit, "qr", "2026-10-14T10:10:00.000Z"),
    pay("p24", "o9", "rent", orders[8].paidRent, "cash", "2026-10-16T08:00:00.000Z"),
    pay("p25", "o10", "deposit", orders[9].depositTotal, "cash", "2026-10-16T08:20:00.000Z"),
    pay("p26", "o10", "rent", orders[9].rentTotal, "cash", "2026-10-18T09:00:00.000Z"),
    pay("p27", "o10", "deposit_refund", orders[9].refundedDeposit, "cash", "2026-10-19T20:10:00.000Z"),
    pay("p28", "o11", "deposit", orders[10].paidDeposit, "transfer", "2026-10-20T11:10:00.000Z", "Cọc một phần"),
    pay("p29", "o12", "deposit", orders[11].paidDeposit, "qr", "2026-10-21T09:10:00.000Z"),
    pay("p30", "o14", "deposit", 200_000, "cash", "2026-10-08T08:20:00.000Z"),
    pay("p31", "o14", "deposit_refund", 200_000, "cash", "2026-10-09T10:00:00.000Z"),
    pay("p32", "o15", "deposit", orders[14].paidDeposit, "transfer", "2026-10-03T08:20:00.000Z"),
    pay("p33", "o15", "rent", orders[14].paidRent, "transfer", "2026-10-05T09:00:00.000Z"),
    pay("pb1", "o4", "rent", 50_000, "cash", "2026-10-02T10:00:00.000Z", "Phụ thu phụ kiện"),
    pay("pb3", "o6", "fee_damage", 50_000, "cash", "2026-10-09T12:00:00.000Z", "Nút áo"),
    pay("pb5", "o10", "fee_late", 50_000, "cash", "2026-10-19T21:00:00.000Z"),
    pay("pb6", "o1", "other", 50_000, "cash", "2026-10-21T14:00:00.000Z", "Ship nội thành"),
  ];

  const events: GarmentEvent[] = isXe
    ? [
        { id: "e1", garmentId: "g2", orderId: "o1", type: "rented", note: "Xuất thuê TH-221001-001", createdAt: "2026-10-20T08:00:00.000Z" },
        { id: "e3", garmentId: "g11", type: "laundry", note: "Bảo dưỡng định kỳ", createdAt: "2026-10-18T12:00:00.000Z" },
        { id: "e4", garmentId: "g1", orderId: "o3", type: "returned", note: "Trả OK + phí vệ sinh", createdAt: "2026-09-17T16:00:00.000Z" },
        { id: "e5", garmentId: "g10", type: "repair", note: "Sửa phanh", createdAt: "2026-10-15T09:00:00.000Z" },
        { id: "e6", garmentId: "g3", orderId: "o8", type: "rented", note: "Xuất thuê TH-221015-008", createdAt: "2026-10-15T08:00:00.000Z" },
        { id: "e7", garmentId: "g13", orderId: "o15", type: "rented", note: "Xuất thuê — đang quá hạn", createdAt: "2026-10-05T09:00:00.000Z" },
        { id: "e8", garmentId: "g14", orderId: "o11", type: "status", note: "Đặt lịch Mercedes", createdAt: "2026-10-20T11:00:00.000Z" },
        { id: "e10", garmentId: "g5", orderId: "o4", type: "returned", note: "Trả OK", createdAt: "2026-09-22T15:00:00.000Z" },
      ]
    : [
        { id: "e1", garmentId: "g2", orderId: "o1", type: "rented", note: "Xuất thuê đơn TH-221001-001", createdAt: "2026-10-20T08:00:00.000Z" },
        { id: "e2", garmentId: "g15", orderId: "o1", type: "rented", note: "Xuất thuê kèm", createdAt: "2026-10-20T08:00:00.000Z" },
        { id: "e3", garmentId: "g12", type: "laundry", note: "Giặt sau đơn trước", createdAt: "2026-10-18T12:00:00.000Z" },
        { id: "e4", garmentId: "g1", orderId: "o3", type: "returned", note: "Trả OK + phí làm sạch", createdAt: "2026-09-17T16:00:00.000Z" },
        { id: "e5", garmentId: "g18", type: "repair", note: "Sửa đường may", createdAt: "2026-10-15T09:00:00.000Z" },
        { id: "e6", garmentId: "g20", orderId: "o8", type: "rented", note: "Xuất thuê TH-221015-008", createdAt: "2026-10-15T08:00:00.000Z" },
        { id: "e7", garmentId: "g26", orderId: "o15", type: "rented", note: "Xuất thuê — đang quá hạn", createdAt: "2026-10-05T09:00:00.000Z" },
        { id: "e8", garmentId: "g1", orderId: "o11", type: "status", note: "Đặt lịch Brand XY", createdAt: "2026-10-20T11:00:00.000Z" },
        { id: "e9", garmentId: "g30", type: "laundry", note: "Giặt định kỳ", createdAt: "2026-10-19T08:00:00.000Z" },
        { id: "e10", garmentId: "g6", orderId: "o4", type: "returned", note: "Trả OK", createdAt: "2026-09-22T15:00:00.000Z" },
      ];

  await db.transaction(
    "rw",
    [
      db.settings,
      db.users,
      db.customers,
      db.garments,
      db.orders,
      db.payments,
      db.garmentEvents,
      db.meta,
    ],
    async () => {
      await db.settings.put(settings);
      await db.users.bulkPut(users);
      await db.customers.bulkPut(customers);
      await db.garments.bulkPut(garments);
      await db.orders.bulkPut(orders);
      await db.payments.bulkPut(payments);
      await db.garmentEvents.bulkPut(events);
      await db.meta.put({ key: "seeded", value: SEED_VERSION });
      await db.meta.put({ key: "orderSeq", value: "15" });
    },
  );
}
