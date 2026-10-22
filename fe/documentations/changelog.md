# Changelog — Dolphin Studio Thuê FE

## 2026-10-23

- **CI:** GitHub Actions `.github/workflows/build.yml` — `npm ci` + `npm run build` trên `fe/` (push/PR `main` + `workflow_dispatch`); cập nhật `deploy.md`.
- **Typography = POS:** `PageHeader` (`text-xl/2xl` + mô tả `text-sm`); section `font-bold`; KPI `text-lg/xl`; bỏ eyebrow + `font-display text-3xl` trên app pages.
- **Sidebar POS-style:** DOLPHIN RENTAL + lĩnh vực; Chi nhánh select (`branchName`/`branches`); badge số đơn mở / trả / kho / thu / nhắc; active thanh trái + `brand-50`; `SEED_VERSION` 11.
- **Trang phục:** ảnh item thấp hơn (`aspect-square` / `5:6`).
- **List bảng:** đơn thuê / khách hàng — cột đều (`grid-cols-N`), canh trái.
- **Dock:** Tổng quan = logo Dolphin; active `!text-white` (+ invert logo); `/menu` tile tương tự.
- **Banner xe:** force `/showcase-banner-xe.jpg` khi vertical `thue-xe` (kể cả settings URL váy cũ); `SEED_VERSION` 10.
- **Trang phục grid:** card marketplace — ảnh 3:4 bo 10px, metadata gọn, desktop 4 cột.
- **Overview CTA:** 4 nút thao tác nhanh nằm bên phải section chào (desktop).
- **Đơn thuê:** KPI overview + list dạng bảng (desktop cột như POS); khách hàng list tương tự.
- **Showcase:** bỏ link Nhân viên; banner riêng thuê xe `showcase-banner-xe.jpg`; `SEED_VERSION` 9.
- **Dock/menu active:** chữ/icon trắng trên nền brand (Home icon thay BrandMark trên dock).
- **Showcase catalog UI:** `/showcase` layout kiểu bộ sưu tập (hero banner ảnh, filter dropdown + sắp xếp, grid card, trust bar); giữ brand tím `#5d5cc4`.
- **Banner admin:** `StoreSettings.showcaseBannerUrl|Headline|Sub|Badge`; seed mặc định `public/showcase-banner.jpg` / `-xe.jpg`; chỉnh tại `/cai-dat`.

## 2026-10-22

- **Theme:** giữ brand tím `#5d5cc4` + font Geist/Inter (hoàn nguyên sau thử boutique); layout tổng quan/showcase/kho/đơn vẫn bản mới; `design-language.md`.
- **Menu mobile:** style SSI/CRM — thẻ user, tab Quản lý/Hỗ trợ, card nhóm + icon tile brand-50.
- **Thuộc tính v2:** nhóm Đặc điểm / Mô tả / Tiện nghi / Giấy tờ / Thế chấp / Điều khoản (xe + trang phục); UI detail theo section; seed đầy đủ; `SEED_VERSION` 7.
- **Showcase v2:** `/showcase/[id]` detail + thuộc tính theo lĩnh vực (`attribute-defs`); filter chip + CTA đặt thuê (tham khảo POS ecommerce); brand seed **Dolphin Studio Váy & Vest** / **Showroom thuê xe Dolphin**; Cài đặt xem định nghĩa attr; `SEED_VERSION` 6.
- **Seed v5 (thuê xe):** 48 xe từ listing marketplace (ảnh CDN + giá/ngày, số chỗ, hộp số, nhiên liệu) trong `seed-vehicles.ts`; bump `SEED_VERSION`.
- **Header CTA chia sẻ:** chỉ mở Web Share sheet (`navigator.share` / `canShare`); không fallback copy.
- **Repo:** remote `nchithanh/rental`; vertical **trang-phuc | thue-xe** (DB tách, seed xe, picker login/cài đặt); header bỏ switch lang; FAB đơn thuê dùng `ClipboardList`.
- **Header / dock:** CTA **Chia sẻ trưng bày** (`/showcase` · Web Share hoặc copy link); nhãn dock mobile «Đơn thuê».
- **Seed v3:** 46 trang phục marketplace (ảnh CDN + giá k/tr) trong `seed-garments.ts`; đơn/payment map lại theo giá mới.
- **Thanh toán (chi tiết đơn):** gợi ý 3 mức VND khi gõ số ngắn (`vndAmountSuggestions` — vd. 100 → 100.000 / 1.000.000 / 10.000.000).
- **Header:** bỏ CTA tạo đơn; thêm switch **VI | EN** (`setLang` / `useLang`).
- **`/don-thue/moi`:** flow giỏ như POS — nút **+ Thêm** vào cart, sheet mobile / panel desktop; bar «X món · tổng» sticky dưới banner (không fixed đáy); bỏ chọn toggle trên list.
- **`/don-thue/moi`:** bar tạo đơn fixed phía trên dock (bỏ sticky giữa list).
- **UX polish:** login chọn chức vụ + fill PIN; trang phục mobile 2 cột; overview KPI có icon + CTA nhanh + filter chart 7/30 ngày + Dolphin AI; header có user + nút tạo đơn.
- **Seed v2 + dashboard charts:** 18 trang phục · 10 khách · 15 đơn · payments dày; tổng quan: area DT 7 ngày, bar đơn/top đồ/tình trạng kho, pie trạng thái đơn. Re-seed khi `SEED_VERSION` đổi.
- **Phase B:** đủ 7 nhóm — sửa trang phục/ảnh; đổi lịch đơn + validate status; chi tiết khách; thanh toán lọc + thu nhanh; trả đồ `?order=` + ghi chú; báo cáo ngày/tháng + list click; CSKH Zalo deep-link + `/showcase` public (form local).
- **Khởi tạo:** clone UI từ POS FE → app riêng `rental_studio`. Domain thuê. Seed demo. Dev :3013. DB `dolphin_rental_studio`.
