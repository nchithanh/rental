import type { Garment, GarmentStatus } from "@/types";

/** Catalog demo lấy từ listing marketplace (ảnh CDN Mioto). */
type Row = {
  name: string;
  rent: number;
  imageUrl: string;
  size: string;
  color: string;
  category: string;
};

const ROWS: Row[] = [
  { name: "Hyundai Elantra 2024", rent: 812000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_elantra_2024/p/g/2026/08/27/14/e-_HSpoqv--pcqcpun1zwg.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mitsubishi Outlander 2024", rent: 1123000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_outlander_2024/p/g/2026/06/21/18/_6sului3bOLTQPVTgGADvQ.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Suzuki Ertiga 2022", rent: 752000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_ertiga_2022/p/g/2026/06/18/18/r9P1owaLC2B8RAPbNw1D5A.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "VinFast Limo Green 2026", rent: 1148000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_limo_green_2026/p/g/2026/07/22/14/XgxJqU3I4Njcg96Ku-j_Gw.jpg", size: "7 chỗ", color: "Số tự động", category: "Điện" },
  { name: "VinFast VF8 Plus 2024", rent: 1191000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf8_plus_2024/p/g/2026/06/28/15/hQvYDVSVPfmTQalpoX6sRA.jpg", size: "5 chỗ", color: "Số tự động", category: "Điện" },
  { name: "VinFast Fadil 2021", rent: 499000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_fadil_2021/p/g/2026/04/12/08/gavk-T9hlNzugjocnkUQuw.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mitsubishi Xforce Premium 2025", rent: 939000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xforce_premium_2025/p/g/2026/04/09/18/OCyihxGJ1AWQNhOZ98dtgg.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mitsubishi Xpander 2022", rent: 759000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2022/p/g/2026/04/06/22/YiBF34D-bB1lGf2WCyO6qg.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "MG RX5 Standard 2023", rent: 770000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mg_rx5_standard_2023/p/g/2026/00/13/20/mPpW3fcKozMHWm3PV4O57Q.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "VinFast Lux A 2022", rent: 884000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_lux_a_2022/p/g/2025/11/30/10/97cbizxQGTpd506duDyMgg.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mazda 3 Deluxe 2022", rent: 688000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mazda_3_deluxe_2022/p/g/2025/11/19/17/LdoWI_bq5a9axEZUB6QNHQ.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mitsubishi Xpander 2025", rent: 911000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2025/p/g/2025/09/13/20/k6pm__QK9T7UEoiiUXhvVg.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Avanza 2024", rent: 877000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_avanza_2024/p/g/2025/09/13/15/3YIwNA97GTUQb9-NzJUfLw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Hyundai Accent 2024", rent: 664000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_accent_2024/p/g/2025/08/09/07/es2bXjM54i3H5YIGBpOHAw.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Veloz Cross 2024", rent: 922000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2024/p/g/2025/04/23/08/LOBFOex8rHWKJGE34li4Iw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "VinFast Fadil 2022", rent: 521000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_fadil_2022/p/g/2024/09/17/15/bc8aHWNJYbN_MGhFjloQ2w.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "VinFast VF3 2026", rent: 608000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2026/p/g/2026/09/14/23/Usxd3VLP55bDPAsrhobceg.jpg", size: "4 chỗ", color: "Số tự động", category: "Điện" },
  { name: "Honda BR-V L 2023", rent: 1143000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_brv-l_2023/p/g/2026/00/24/10/whffYB0Fjp6zMEyRk7dU3w.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Suzuki XL7 2020", rent: 897000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_2020/p/g/2024/08/09/15/CdQzz8EAc5a8KKpYW7Sh1Q.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Chevrolet Trailblazer 2019", rent: 1005000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/chevrolet_trailblazer_2019/p/g/2024/08/01/11/xRSqxTTqJrZBpiyPRcBk9w.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "Toyota Innova 2021", rent: 1028000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2021/p/g/2026/04/04/12/ZEEAGtFEi6saw2Jl6qDqPA.jpg", size: "8 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Hyundai Stargazer 2025", rent: 971000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_stargazer_2025/p/g/2026/00/25/21/oAJ-HEKUrK-YiaxYNC_SxA.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "VinFast Lux SA 2020", rent: 1292000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_lux_sa__2020/p/g/2026/05/29/11/Ve8N8Xu8r1OSZ0kToDBIdA.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "VinFast VF5 2025", rent: 897000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf5_2025/p/g/2025/10/22/11/gHjsHkx_svu9_vlPhxSglw.jpg", size: "5 chỗ", color: "Số tự động", category: "Điện" },
  { name: "VinFast VF8 Eco 2023", rent: 1271000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf8_eco_2023/p/g/2025/11/14/18/gbaHvy60F154nExszMvosw.jpg", size: "5 chỗ", color: "Số tự động", category: "Điện" },
  { name: "VinFast VF3 2025", rent: 545000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2025/p/g/2026/00/14/09/6CQgAqu019L8u60K4S5yWQ.jpg", size: "4 chỗ", color: "Số tự động", category: "Điện" },
  { name: "Mitsubishi Xpander Cross 2024", rent: 994000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_cross_2024/p/g/2026/03/10/19/pYyHTCZOsQ8rBy3hUmjxjA.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Mitsubishi Xpander 2023", rent: 1028000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2023/p/g/2023/09/12/13/S92iT1zKt9BZOIubBqoxFw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Innova 2018", rent: 833000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2018/p/g/2026/07/29/13/TCzxmDseCRaUhPrJcCY_rQ.jpg", size: "8 chỗ", color: "Số sàn", category: "Xăng" },
  { name: "Honda City 2026", rent: 905000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_city_2026/p/g/2026/08/20/13/AI8vNsu6dZl18LxDpZdS0Q.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Chevrolet Aveo 2018", rent: 574000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/chevrolet_aveo_2018/p/g/2025/04/03/16/i2qHE73S6pN8cdJLzeEI1g.jpg", size: "5 chỗ", color: "Số sàn", category: "Xăng" },
  { name: "Honda City RS 2025", rent: 1033000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_city_rs_2025/p/g/2026/01/27/14/j1EzrGIplnHeRdNpc5vzcA.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Corolla Altis 2015", rent: 802000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_corolla_altis_2015/p/g/2026/02/06/10/4fh-mUDaiQORT4XaTteuNg.jpg", size: "5 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Veloz Cross 2023", rent: 936000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_veloz_cross_2023/p/g/2023/07/03/13/sztsTc6JoVqeZV5bUIKp_A.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Toyota Innova Cross Hybrid 2026", rent: 1486000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/_toyota_innova_cross_hybrid_2026/p/g/2026/09/01/13/4KRUxOXvNrW2PaZuoT2GKw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Honda CR-V L 2018", rent: 906000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/honda_crv_l_2018/p/g/2025/02/01/10/B7Rki_6P6Sj_qgk8vpyIUA.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Kia Carnival Premium 2022", rent: 1712000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carnival_premium_2022/p/g/2025/01/17/17/_5avuVKP0l9algg0IcNHcw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "Toyota Innova 2019", rent: 1085000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/toyota_innova_2019/p/g/2026/03/11/07/UdIkJ3Kwsyr5DS020hmunQ.jpg", size: "8 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Hyundai Stargazer 2024", rent: 913000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/hyundai_stargazer_2024/p/g/2026/01/14/11/3rNovMJFtvoNYX5g5OrNAg.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "BYD Dolphin 2026", rent: 997000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/byd_dolphin_2026/p/g/2026/09/16/09/W0gbHD7LoCDaSPmJVUBRNg.jpg", size: "5 chỗ", color: "Số tự động", category: "Điện" },
  { name: "Mitsubishi Xpander 2020", rent: 775000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/mitsubishi_xpander_2020/p/g/2025/09/11/17/kV5GF6OB16DX0rojT73YpQ.jpg", size: "7 chỗ", color: "Số sàn", category: "Xăng" },
  { name: "Kia Carens 2024", rent: 1279000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carens_2024/p/g/2024/10/11/16/Fskl2mXoDrcznI2yA8QdXg.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Kia Sorento Luxury 2019", rent: 1231000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_sorento_luxury_2019/p/g/2024/02/18/14/bKipbnzX0rwEiz4IZvj88Q.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "Suzuki XL7 2022", rent: 1028000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/suzuki_xl7_2022/p/g/2023/02/28/20/KNx4ZDZd4Omx8JAaR0nGZw.jpg", size: "7 chỗ", color: "Số tự động", category: "Xăng" },
  { name: "Kia Carnival Signature 2.2 2022", rent: 1935000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carnival_signature_2.2_2022/p/g/2025/01/10/01/lBLfR4SV6x_VTf77dG9Aog.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "Kia Sedona Premium 2019", rent: 1416000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_sedona_premium_2019/p/g/2024/09/15/15/Ch3FS7LjMohQK17BOUWSjA.jpg", size: "7 chỗ", color: "Số tự động", category: "Xe" },
  { name: "VinFast VF3 2024", rent: 576000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/vinfast_vf3_2024/p/g/2025/05/18/17/PS6Ao3Ede3cM5_p7vTATAQ.jpg", size: "4 chỗ", color: "Số tự động", category: "Điện" },
  { name: "Kia Carnival Signature 2.2 2023", rent: 2401000, imageUrl: "https://n1-pstg.mioto.vn/cho_thue_xe_o_to_tu_lai_thue_xe_du_lich_hochiminh/kia_carnival_signature_2.2_2023/p/g/2025/05/12/09/2XAANXUCEz0nYMv2z3-1ow.jpg", size: "8 chỗ", color: "Số tự động", category: "Xe" },
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
      emoji: "🚗",
      imageUrl: row.imageUrl,
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
