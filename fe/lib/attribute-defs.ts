import type { VerticalId } from "@/lib/vertical-core";

/** Nhóm hiển thị trên detail (mọi field đều là thuộc tính). */
export type AttrGroupId =
  | "specs"
  | "description"
  | "amenities"
  | "documents"
  | "collateral"
  | "terms";

export type AttrKind = "text" | "long" | "chips";

/** Định nghĩa thuộc tính theo lĩnh vực (admin xem tại Cài đặt; seed/hardcode tạm). */
export type AttrDef = {
  key: string;
  label: string;
  group: AttrGroupId;
  kind?: AttrKind;
  /** Hiện chip filter trên showcase */
  filterable?: boolean;
  /** Map sang field lõi size | color | category khi lưu */
  core?: "size" | "color" | "category";
};

export type AttrGroupMeta = {
  id: AttrGroupId;
  label: string;
  hint?: string;
};

const GROUPS_XE: AttrGroupMeta[] = [
  { id: "specs", label: "Đặc điểm" },
  { id: "description", label: "Mô tả" },
  { id: "amenities", label: "Các tiện nghi khác" },
  {
    id: "documents",
    label: "Giấy tờ thuê xe",
    hint: "Chọn 1 trong 2 hình thức",
  },
  { id: "collateral", label: "Tài sản thế chấp" },
  { id: "terms", label: "Điều khoản" },
];

const GROUPS_TRANG_PHUC: AttrGroupMeta[] = [
  { id: "specs", label: "Đặc điểm" },
  { id: "description", label: "Mô tả" },
  { id: "amenities", label: "Phụ kiện kèm theo" },
  {
    id: "documents",
    label: "Giấy tờ khi nhận đồ",
    hint: "Mang theo khi đến studio",
  },
  { id: "collateral", label: "Cọc / thế chấp" },
  { id: "terms", label: "Điều khoản" },
];

export const ATTRIBUTE_GROUPS: Record<VerticalId, AttrGroupMeta[]> = {
  "trang-phuc": GROUPS_TRANG_PHUC,
  "thue-xe": GROUPS_XE,
};

const TRANG_PHUC: AttrDef[] = [
  { key: "size", label: "Size", group: "specs", filterable: true, core: "size" },
  { key: "color", label: "Màu", group: "specs", filterable: true, core: "color" },
  {
    key: "category",
    label: "Loại",
    group: "specs",
    filterable: true,
    core: "category",
  },
  { key: "material", label: "Chất liệu", group: "specs" },
  { key: "style", label: "Phong cách", group: "specs" },
  { key: "occasion", label: "Dịp dùng", group: "specs" },
  { key: "brand_label", label: "Thương hiệu", group: "specs" },
  { key: "length", label: "Độ dài", group: "specs" },
  { key: "description", label: "Mô tả", group: "description", kind: "long" },
  {
    key: "amenities",
    label: "Phụ kiện",
    group: "amenities",
    kind: "chips",
  },
  {
    key: "document_opt1",
    label: "Hình thức 1",
    group: "documents",
    kind: "long",
  },
  {
    key: "document_opt2",
    label: "Hình thức 2",
    group: "documents",
    kind: "long",
  },
  {
    key: "collateral",
    label: "Cọc / thế chấp",
    group: "collateral",
    kind: "long",
  },
  { key: "terms", label: "Điều khoản", group: "terms", kind: "long" },
];

const THUE_XE: AttrDef[] = [
  {
    key: "transmission",
    label: "Truyền động",
    group: "specs",
    filterable: true,
    core: "color",
  },
  {
    key: "seats",
    label: "Số ghế",
    group: "specs",
    filterable: true,
    core: "size",
  },
  {
    key: "fuel",
    label: "Nhiên liệu",
    group: "specs",
    filterable: true,
    core: "category",
  },
  { key: "consumption", label: "Tiêu hao", group: "specs" },
  { key: "brand", label: "Hãng", group: "specs", filterable: true },
  { key: "year", label: "Năm SX", group: "specs" },
  { key: "delivery", label: "Giao xe", group: "specs" },
  { key: "description", label: "Mô tả", group: "description", kind: "long" },
  {
    key: "amenities",
    label: "Tiện nghi",
    group: "amenities",
    kind: "chips",
  },
  {
    key: "document_opt1",
    label: "Hình thức 1",
    group: "documents",
    kind: "long",
  },
  {
    key: "document_opt2",
    label: "Hình thức 2",
    group: "documents",
    kind: "long",
  },
  {
    key: "collateral",
    label: "Tài sản thế chấp",
    group: "collateral",
    kind: "long",
  },
  { key: "terms", label: "Điều khoản", group: "terms", kind: "long" },
];

export const ATTRIBUTE_DEFS: Record<VerticalId, AttrDef[]> = {
  "trang-phuc": TRANG_PHUC,
  "thue-xe": THUE_XE,
};

export function getAttributeDefs(vertical: VerticalId): AttrDef[] {
  return ATTRIBUTE_DEFS[vertical] ?? TRANG_PHUC;
}

export function getAttributeGroups(vertical: VerticalId): AttrGroupMeta[] {
  return ATTRIBUTE_GROUPS[vertical] ?? GROUPS_TRANG_PHUC;
}

export function getFilterableDefs(vertical: VerticalId): AttrDef[] {
  return getAttributeDefs(vertical).filter((d) => d.filterable);
}

export function defsByGroup(
  vertical: VerticalId,
  group: AttrGroupId,
): AttrDef[] {
  return getAttributeDefs(vertical).filter((d) => d.group === group);
}

/** Chips lưu dạng "A · B · C" hoặc "A, B, C". */
export function parseChipValues(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/\s*[·|,;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinChipValues(items: string[]): string {
  return items.filter(Boolean).join(" · ");
}

/** Giá trị thuộc tính: ưu tiên attrs[key], fallback field lõi. */
export function getAttrValue(
  item: {
    size: string;
    color: string;
    category: string;
    attrs?: Record<string, string>;
  },
  def: AttrDef,
): string {
  const fromAttrs = item.attrs?.[def.key]?.trim();
  if (fromAttrs) return fromAttrs;
  if (def.core === "size") return item.size;
  if (def.core === "color") return item.color;
  if (def.core === "category") return item.category;
  return "";
}

export function attrsFromForm(
  vertical: VerticalId,
  values: Record<string, string>,
): {
  size: string;
  color: string;
  category: string;
  attrs: Record<string, string>;
} {
  const defs = getAttributeDefs(vertical);
  let size = "—";
  let color = "—";
  let category = "—";
  const attrs: Record<string, string> = {};
  for (const def of defs) {
    const v = (values[def.key] ?? "").trim();
    if (!v) continue;
    if (def.core === "size") size = v;
    else if (def.core === "color") color = v;
    else if (def.core === "category") category = v;
    attrs[def.key] = v;
  }
  return { size, color, category, attrs };
}
