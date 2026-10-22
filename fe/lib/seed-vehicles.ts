import type { Garment, GarmentStatus } from "@/types";

type Row = {
  name: string;
  rent: number;
  emoji: string;
  size: string;
  color: string;
  category: string;
};

/** Catalog demo thuê xe (local-first). */
const ROWS: Row[] = [
  { name: "Toyota Vios 2023 AT", rent: 800_000, emoji: "🚗", size: "4 chỗ", color: "Trắng", category: "Sedan" },
  { name: "Honda City RS 2024", rent: 900_000, emoji: "🚘", size: "4 chỗ", color: "Đỏ", category: "Sedan" },
  { name: "Mazda 3 Sport", rent: 1_100_000, emoji: "🚗", size: "5 chỗ", color: "Xám", category: "Sedan" },
  { name: "Hyundai Accent", rent: 750_000, emoji: "🚙", size: "4 chỗ", color: "Bạc", category: "Sedan" },
  { name: "Toyota Innova Cross", rent: 1_400_000, emoji: "🚐", size: "7 chỗ", color: "Đen", category: "MPV" },
  { name: "Mitsubishi Xpander", rent: 1_200_000, emoji: "🚐", size: "7 chỗ", color: "Trắng", category: "MPV" },
  { name: "Ford Ranger Wildtrak", rent: 1_600_000, emoji: "🛻", size: "5 chỗ", color: "Cam", category: "Bán tải" },
  { name: "Kia Carnival", rent: 1_800_000, emoji: "🚌", size: "7 chỗ", color: "Đen", category: "MPV" },
  { name: "VinFast VF e34", rent: 1_000_000, emoji: "⚡", size: "5 chỗ", color: "Xanh", category: "Điện" },
  { name: "VinFast VF 5 Plus", rent: 850_000, emoji: "⚡", size: "5 chỗ", color: "Trắng", category: "Điện" },
  { name: "Yamaha Exciter 155", rent: 250_000, emoji: "🏍️", size: "2 chỗ", color: "Đen", category: "Xe máy" },
  { name: "Honda SH 160i", rent: 350_000, emoji: "🛵", size: "2 chỗ", color: "Trắng", category: "Xe máy" },
  { name: "Toyota Camry 2.5Q", rent: 2_000_000, emoji: "🚗", size: "5 chỗ", color: "Đen", category: "Sedan" },
  { name: "Mercedes C200", rent: 3_500_000, emoji: "✨", size: "5 chỗ", color: "Trắng", category: "Premium" },
  { name: "Xe 16 chỗ Hyundai Solati", rent: 2_500_000, emoji: "🚌", size: "16 chỗ", color: "Bạc", category: "Khách" },
];

export function buildSeedVehicles(): Garment[] {
  return ROWS.map((row, i) => {
    const n = i + 1;
    const deposit = Math.max(
      row.rent,
      Math.round((row.rent * 1.5) / 50_000) * 50_000,
    );
    const day = String((i % 28) + 1).padStart(2, "0");
    return {
      id: `g${n}`,
      code: `XE-${String(n).padStart(3, "0")}`,
      name: row.name,
      emoji: row.emoji,
      size: row.size,
      color: row.color,
      category: row.category,
      rentPrice: row.rent,
      depositDefault: deposit,
      status: "ready" as GarmentStatus,
      active: true,
      createdAt: `2026-07-${day}T08:00:00.000Z`,
    };
  });
}
