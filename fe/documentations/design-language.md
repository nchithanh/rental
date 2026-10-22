# Design language — Dolphin Rental FE

Brand chrome chung mọi lĩnh vực: **tím Dolphin `#5d5cc4`**.

## Palette (SoT `fe/app/globals.css`)

| Token | Value | Role |
| --- | --- | --- |
| `--background` | `#f4f6f8` | Page |
| `--brand-500` | `#5d5cc4` | CTA, nav active, accent |
| `--brand-50` / `--banner` | `#f3f3fb` | Soft wash |
| Emerald Tailwind utils | remap → brand | Legacy class tương thích |

## Typography (SoT = POS FE `PageHeader`)

| Role | Class |
| --- | --- |
| Tiêu đề trang `h1` | `text-xl font-bold tracking-tight sm:text-2xl` |
| Mô tả trang | `mt-1 text-sm text-slate-500` |
| Section `h2` | `font-bold` |
| Nhãn KPI | `text-sm text-slate-500` |
| Giá trị KPI | `text-lg font-bold sm:text-xl` |
| Tên item catalog | `text-sm font-bold` |
| Giá item | `text-base font-bold` |

Dùng `components/ui/page-header.tsx`. Không dùng eyebrow uppercase + `text-3xl` trên app pages (showcase public có thể khác).

## Surfaces

- Cards: trắng, bo `12px`, shadow nhẹ
- Buttons: pill; primary = brand (remap emerald)
- Status badges: `lib/labels.ts` (emerald / sky / amber / rose + brand)

## Shell

- Sidebar: logo + **DOLPHIN RENTAL** + dòng lĩnh vực; khối Chi nhánh (select); item active = nền `brand-50` + thanh dọc brand trái; badge số pill brand
- Mobile dock / `/menu` tile active: chỉ màu brand (icon + chữ), không nền; FAB brand tím; badge số vẫn pill brand
- Layout tổng quan / showcase giữ cấu trúc mới, màu brand
- `/showcase`: layout kiểu boutique catalog (hero ảnh + filter bar + grid 2–4 cột + trust bar); chrome vẫn `--brand-*`, không navy/gold
