# Lĩnh vực (verticals)

Hai lĩnh vực demo, IndexedDB tách:

| Id | Nhãn | DB |
| --- | --- | --- |
| `trang-phuc` | Thuê trang phục | `dolphin_rental_trang-phuc` |
| `thue-xe` | Thuê xe | `dolphin_rental_thue-xe` |

## Chọn lĩnh vực

- Login: 2 thẻ chọn → `localStorage` key `dolphin-rental-vertical` → reload + seed.
- Cài đặt: đổi lĩnh vực (xác nhận) → logout + reload.

## SoT code

- `fe/lib/vertical.ts` — options + copy + `setVertical`
- `fe/lib/db.ts` — tên DB theo vertical
- Seed: `seed-garments.ts` (marketplace trang phục) / `seed-vehicles.ts` (48 xe demo + ảnh CDN) · `SEED_VERSION` trong `seed.ts`
- Nav: `getNavGroups(vertical)`

Brand chrome chung `#5D5CC4`.
