import { Car, Shirt, type LucideIcon } from "lucide-react";

export type VerticalId = "trang-phuc" | "thue-xe";

export const VERTICAL_STORAGE_KEY = "dolphin-rental-vertical";
export const VERTICAL_EVENT = "dolphin-rental-vertical";

export type VerticalCopy = {
  id: VerticalId;
  label: string;
  description: string;
  appTitle: string;
  catalog: string;
  catalogShort: string;
  returnItem: string;
  assetSingular: string;
  laundry: string;
  repair: string;
  icon: LucideIcon;
  emojiFallback: string;
};

export const VERTICAL_OPTIONS: VerticalCopy[] = [
  {
    id: "trang-phuc",
    label: "Thuê trang phục",
    description: "Studio váy · vest · áo dài · phụ kiện",
    appTitle: "Dolphin Studio Thuê",
    catalog: "Trang phục",
    catalogShort: "Đồ",
    returnItem: "Trả đồ",
    assetSingular: "trang phục",
    laundry: "Đang giặt",
    repair: "Sửa chữa",
    icon: Shirt,
    emojiFallback: "👗",
  },
  {
    id: "thue-xe",
    label: "Thuê xe",
    description: "Xe tự lái · có tài · cọc & bảo hiểm",
    appTitle: "Dolphin Thuê Xe",
    catalog: "Xe",
    catalogShort: "Xe",
    returnItem: "Trả xe",
    assetSingular: "xe",
    laundry: "Bảo dưỡng",
    repair: "Sửa chữa",
    icon: Car,
    emojiFallback: "🚗",
  },
];

export function isVerticalId(v: string | null | undefined): v is VerticalId {
  return v === "trang-phuc" || v === "thue-xe";
}

export function readVertical(): VerticalId {
  if (typeof window === "undefined") return "trang-phuc";
  const stored = window.localStorage.getItem(VERTICAL_STORAGE_KEY);
  return isVerticalId(stored) ? stored : "trang-phuc";
}

export function getVerticalCopy(id: VerticalId = readVertical()): VerticalCopy {
  return VERTICAL_OPTIONS.find((o) => o.id === id) ?? VERTICAL_OPTIONS[0];
}

export function setVertical(id: VerticalId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VERTICAL_STORAGE_KEY, id);
  window.dispatchEvent(new Event(VERTICAL_EVENT));
  window.location.reload();
}
