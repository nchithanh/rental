import type { Garment, GarmentStatus } from "@/types";

/** Catalog demo lấy từ listing marketplace (ảnh CDN). */
const IMG =
  "https://www.thuedo.de/t/w_400,h_300,c_fill,q_80/rentanything/imports/";

type Row = {
  name: string;
  rent: number;
  file: string;
  size: string;
  category: string;
};

const ROWS: Row[] = [
  { name: "Brand XY Bymyxy sz SM", rent: 800000, file: "nsk4lvfbad9ttrgz91oa.webp", size: "SM", category: "Váy" },
  { name: "Amy sz S", rent: 1000000, file: "vsxe8dumtap9frblwhbs.webp", size: "S", category: "Váy" },
  { name: "Lovelyn sz SML", rent: 550000, file: "eiqbjubhktkpzdj44rqm.webp", size: "SML", category: "Váy" },
  { name: "Paramo sz SML", rent: 450000, file: "gu8sexj9jg8uuaqhj1pe.webp", size: "SML", category: "Váy" },
  { name: "RidKid sz SM", rent: 540000, file: "x6whi00mnrzna5yk0rvg.webp", size: "SM", category: "Váy" },
  { name: "Váy Dự Tiệc Linh Phung sz SML", rent: 750000, file: "bmqyiam7xnwf8x6av0hb.webp", size: "SML", category: "Váy" },
  { name: "Brand Calista de Minh Thanh sz SM", rent: 900000, file: "j0zl4jehqx7fdienurzp.webp", size: "SM", category: "Váy" },
  { name: "Lovelyn sz ML", rent: 500000, file: "wzit0jp58iulvod7jwvq.webp", size: "ML", category: "Váy" },
  { name: "Cho thuê váy Sanri Design", rent: 400000, file: "56b74acf-f052-4f60-b1b9-fd29096d2f19.webp", size: "Freesize", category: "Váy" },
  { name: "Váy Chou Chou Váy ren trắng - sz M", rent: 250000, file: "xxd48zqems91lmrerva6.webp", size: "M", category: "Váy" },
  { name: "Elena Dress - sz M (áo + cv)", rent: 230000, file: "7b9bd411-9795-4d4c-9066-d95161a26f15.webp", size: "M", category: "Set" },
  { name: "Váy trễ vai voan màu trắng size S, M", rent: 300000, file: "gmoek75u9h9nnd3zwnhs.webp", size: "S, M", category: "Váy" },
  { name: "Đầm Mộng Bích - freesz", rent: 230000, file: "b1fa2da2-1d5a-436f-ac8e-20b5b97cd722.webp", size: "Freesize", category: "Váy" },
  { name: "WEWEAR Alaia Dress - sz 1", rent: 330000, file: "8800f851-30e6-4eb5-9cba-220fc052efdc.webp", size: "1", category: "Váy" },
  { name: "Set QCCC - sz M", rent: 150000, file: "d048bd31-25ef-406e-8512-05ad2b614bdc.webp", size: "M", category: "Set" },
  { name: "Camelia Dress - sz S/M", rent: 430000, file: "anofkoup08wdt2q3fcyr.webp", size: "S/M", category: "Váy" },
  { name: "Set áo + quần HUONG BOUTIQUE", rent: 400000, file: "9acc48c6-ae19-4468-8324-82c0c942b43b.webp", size: "Freesize", category: "Set" },
  { name: "Chou Chou váy ren sz M", rent: 150000, file: "63d1eb07-b058-42ff-a0bc-8cdf955af3f4.webp", size: "M", category: "Váy" },
  { name: "Hương Boutique Lace Dress - sz M", rent: 400000, file: "a9e134c6-c643-4fa8-bdf5-6058524fc8b7.webp", size: "M", category: "Váy" },
  { name: "Palido Pink Dress sz S fix M", rent: 450000, file: "bmzuv59honx1qn1ykz6t.webp", size: "S", category: "Váy" },
  { name: "Palido váy hoa ngắn - sz M", rent: 500000, file: "kxob2ggusjwcqfndwoa1.webp", size: "M", category: "Váy" },
  { name: "Trixie Jumpsuit - sz M", rent: 150000, file: "f2960cae-cde9-4372-8744-0bea171ef5cd.webp", size: "M", category: "Jumpsuit" },
  { name: "Váy bí chấm bi size M", rent: 250000, file: "ut0o89p9lcrq5japlqpj.webp", size: "M", category: "Váy" },
  { name: "Chou Chou váy ren trắng - sz M", rent: 250000, file: "b187a21d-2419-4ef7-94f1-76be3b48b53e.webp", size: "M", category: "Váy" },
  { name: "G.U Lunar Dress - sz S", rent: 200000, file: "39b5a62b-f3ac-4291-81af-874a36f48e59.webp", size: "S", category: "Váy" },
  { name: "Leilani Dress - sz M", rent: 500000, file: "7d32531b-aefb-4085-8be5-eb2cfc8c9518.webp", size: "M", category: "Váy" },
  { name: "Honey Set - sz M", rent: 250000, file: "98b99efd-1eb7-42d4-973a-a638cce2251f.webp", size: "M", category: "Set" },
  { name: "Váy Bageo", rent: 130000, file: "baf2adfa-9dd4-4766-8987-23d521c05c6b.webp", size: "Freesize", category: "Váy" },
  { name: "CHEN MERMAID DRESS - sz S", rent: 120000, file: "7ba61ae9-8451-4758-8c42-7fa88cad1379.webp", size: "S", category: "Váy" },
  { name: "Đầm đen ngắn voan tơ tay phồng - sz S", rent: 380000, file: "a11f2559-0659-4231-a8dc-b4c855caaecc.webp", size: "S", category: "Váy" },
  { name: "Alice Dress - sz M", rent: 200000, file: "8505583b-1958-4121-a323-4628abbfc9d5.webp", size: "M", category: "Váy" },
  { name: "Áo quây cúp ngực - sz S", rent: 300000, file: "e805f8cb-b114-4077-b78a-ac6edf61bb4c.webp", size: "S", category: "Áo" },
  { name: "Váy Mare", rent: 450000, file: "9aa12b9e-2a7d-4342-8003-73fea29c3b06.webp", size: "Freesize", category: "Váy" },
  { name: "Váy JENNIE CHOO", rent: 300000, file: "4ea7d7fb-606a-41ed-a244-4b61d5a04e42.webp", size: "Freesize", category: "Váy" },
  { name: "Set váy ren be", rent: 200000, file: "a6af78b0-b7a5-4cc5-92a6-584b20dd9eef.webp", size: "Freesize", category: "Set" },
  { name: "Áo tiểu thư ren sang chảnh size M", rent: 100000, file: "gs7o2i4ueczvqpd4pcss.webp", size: "M", category: "Áo" },
  { name: "Cellita.corset - sz S", rent: 350000, file: "504e1fb7-6c49-4105-bab6-4e5cfa6b7121.webp", size: "S", category: "Áo" },
  { name: "Wrinkled Silk Dress - sz M", rent: 350000, file: "bde8a367-6c68-43c9-b02f-1c45550d9db3.webp", size: "M", category: "Váy" },
  { name: "Ara Evell Dress - sz M", rent: 200000, file: "46f87442-d8c4-4640-952a-5138a4e07768.webp", size: "M", category: "Váy" },
  { name: "Ara Vaelis Dress - sz M", rent: 300000, file: "882436aa-1347-4034-aa9a-8dc137236c0c.webp", size: "M", category: "Váy" },
  { name: "Áo hai dây dạ tweed trắng size S", rent: 350000, file: "b3o8doebiijvcqajrizd.webp", size: "S", category: "Áo" },
  { name: "OLV Wrenlee Dress - sz M", rent: 200000, file: "02817426-633a-42b2-b95e-8e71f2b3b4cc.webp", size: "M", category: "Váy" },
  { name: "RÉNEE Dress", rent: 300000, file: "da872f18-891d-4755-bcfa-08f1a2c81563.webp", size: "Freesize", category: "Váy" },
  { name: "KISSERINE ATELIER Phoebe Dress - sz M", rent: 400000, file: "6f670238-1d1c-4fb6-9a0d-fb39fee91a4d.webp", size: "M", category: "Váy" },
  { name: "Áo lông QCCC", rent: 150000, file: "j1wvyqn2tr3jjvmizmnp.webp", size: "Freesize", category: "Áo" },
  { name: "Váy lông trắng - sz M", rent: 200000, file: "a53e8194-c2a9-4b36-a8c8-4a370fadd458.webp", size: "M", category: "Váy" },
];

const MATERIALS = ["Voan", "Ren", "Lụa", "Tuyết mưa", "Cotton", "Nhung"];
const STYLES = ["Tiểu thư", "Tối giản", "Sang trọng", "Vintage", "Hàn Quốc"];
const OCCASIONS: Record<string, string> = {
  Váy: "Dự tiệc / cocktail",
  Set: "Sự kiện · chụp ảnh",
  Jumpsuit: "Party · đi chơi",
  Áo: "Phối đồ dự tiệc",
};
const LENGTHS = ["Ngắn", "Midi", "Dài", "Maxi"];
const COLORS = ["Trắng", "Đen", "Be", "Hồng", "Xanh navy", "Đỏ rượu"];
const ACCESSORY_POOL = [
  "Túi nhỏ",
  "Thắt lưng",
  "Khăn choàng",
  "Găng tay",
  "Kẹp tóc",
  "Áo choàng mỏng",
  "Giày (thuê riêng)",
];

export function buildSeedGarments(): Garment[] {
  return ROWS.map((row, i) => {
    const n = i + 1;
    const deposit = Math.max(
      row.rent,
      Math.round((row.rent * 1.25) / 50_000) * 50_000,
    );
    const day = String((i % 28) + 1).padStart(2, "0");
    const color = COLORS[i % COLORS.length];
    const material = MATERIALS[i % MATERIALS.length];
    const style = STYLES[i % STYLES.length];
    const occasion = OCCASIONS[row.category] ?? "Thuê ngày lễ";
    const brandLabel = row.name.split(/\s+/)[0] || "Boutique";
    const amenities = ACCESSORY_POOL.slice(0, 3 + (i % 4)).join(" · ");
    const attrs: Record<string, string> = {
      size: row.size,
      color,
      category: row.category,
      material,
      style,
      occasion,
      brand_label: brandLabel,
      length: LENGTHS[i % LENGTHS.length],
      description: `${row.category} ${style.toLowerCase()} · chất liệu ${material.toLowerCase()}. Phù hợp ${occasion.toLowerCase()}. Giặt khô / hấp theo hướng dẫn studio trước khi trả.`,
      amenities,
      document_opt1: "CCCD (đối chiếu) & đặt cọc theo bảng giá",
      document_opt2: "Passport (giữ lại) & đặt cọc theo bảng giá",
      collateral:
        i % 4 === 0
          ? "Cọc bằng chuyển khoản · không giữ xe máy"
          : "Cọc tiền mặt hoặc CK bằng giá cọc mặc định trên phiếu",
      terms:
        "Không tự ý chỉnh sửa / cắt may. Bồi thường nếu rách, ố không khắc phục được. Trả muộn tính phí theo ngày. Studio hỗ trợ chỉnh fit nhẹ trong giờ nhận đồ.",
    };
    return {
      id: `g${n}`,
      code: `TD-${String(n).padStart(3, "0")}`,
      name: row.name,
      emoji: "👗",
      imageUrl: `${IMG}${row.file}`,
      size: row.size,
      color,
      category: row.category,
      attrs,
      rentPrice: row.rent,
      depositDefault: deposit,
      status: "ready" as GarmentStatus,
      active: true,
      createdAt: `2026-07-${day}T08:00:00.000Z`,
    };
  });
}

