import {
  LayoutDashboard,
  Shirt,
  Car,
  ClipboardList,
  UsersRound,
  Wallet,
  PackageCheck,
  BarChart3,
  Bell,
  Store,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { PermissionKey } from "@/types";
import { getVerticalCopy, type VerticalId } from "@/lib/vertical-core";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  mobilePrimary?: boolean;
  mobileLabel?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export function getNavGroups(vertical?: VerticalId): NavGroup[] {
  const copy = getVerticalCopy(vertical);
  const CatalogIcon = copy.id === "thue-xe" ? Car : Shirt;

  return [
    {
      id: "home",
      label: "Tổng quan",
      items: [
        {
          href: "/",
          label: "Tổng quan",
          icon: LayoutDashboard,
          mobilePrimary: true,
        },
      ],
    },
    {
      id: "catalog",
      label: copy.catalog,
      items: [
        {
          href: "/trang-phuc",
          label: copy.catalog,
          icon: CatalogIcon,
          permission: "trang-phuc",
          mobilePrimary: true,
          mobileLabel: copy.catalogShort,
        },
      ],
    },
    {
      id: "orders",
      label: "Đơn thuê",
      items: [
        {
          href: "/don-thue",
          label: "Đơn thuê",
          icon: ClipboardList,
          permission: "don-thue",
          mobilePrimary: true,
          mobileLabel: "Đơn thuê",
        },
        {
          href: "/tra-do",
          label: copy.returnItem,
          icon: PackageCheck,
          permission: "don-thue",
        },
      ],
    },
    {
      id: "crm",
      label: "Khách & thu",
      items: [
        {
          href: "/khach-hang",
          label: "Khách hàng",
          icon: UsersRound,
          permission: "khach-hang",
        },
        {
          href: "/thanh-toan",
          label: "Thanh toán & cọc",
          icon: Wallet,
          permission: "thanh-toan",
          mobilePrimary: true,
          mobileLabel: "Thu",
        },
      ],
    },
    {
      id: "insight",
      label: "Báo cáo & CSKH",
      items: [
        {
          href: "/bao-cao",
          label: "Báo cáo",
          icon: BarChart3,
          permission: "bao-cao",
        },
        {
          href: "/cham-soc",
          label: "Nhắc lịch / Zalo",
          icon: Bell,
          permission: "cai-dat",
        },
        {
          href: "/showcase",
          label: "Website trưng bày",
          icon: Store,
          permission: "cai-dat",
        },
        {
          href: "/cai-dat",
          label: "Cài đặt",
          icon: Settings,
          permission: "cai-dat",
        },
      ],
    },
  ];
}

/** Default — trang phục (SSR / import tĩnh). */
export const NAV_GROUPS = getNavGroups("trang-phuc");

export function isNavActive(href: string, pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname || "/";
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
