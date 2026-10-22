# Architecture — Dolphin Studio Thuê

## Stack

- Next.js App Router · React · Tailwind · Dexie (IndexedDB) · Zustand auth · framer-motion  
- Dev: `npm run dev` → **:3013**  
- DB name: `dolphin_rental_studio`

## Domain tables

`settings` · `users` · `customers` · `garments` · `orders` · `payments` · `garmentEvents` · `meta`

## Routes (FE)

| Path | Module |
| --- | --- |
| `/` | Tổng quan |
| `/trang-phuc`, `/trang-phuc/[id]` | Trang phục |
| `/don-thue`, `/don-thue/moi`, `/don-thue/[id]` | Đơn thuê |
| `/tra-do` | Trả đồ |
| `/khach-hang` | Khách |
| `/thanh-toan` | Thanh toán & cọc |
| `/bao-cao` | Báo cáo |
| `/cham-soc` | Nhắc lịch / Zalo deep-link |
| `/showcase` | Public trưng bày (no auth); banner váy `/showcase-banner.jpg` · xe `/showcase-banner-xe.jpg` (StoreSettings) |
| `/cai-dat` | Studio + chỉnh banner trưng bày |
| `/cai-dat` | Cài đặt |
| `/login`, `/menu` | Auth · menu mobile |

## Logic thuê

`fe/lib/rental.ts` — overlap lịch, tạo đơn, `updateOrderDates`, đổi status, thanh toán, completeReturn.
