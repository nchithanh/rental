# Changelog — Dolphin Studio Thuê FE

## 2026-10-22

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
