export const DEMO_ACCOUNTS = [
  {
    label: "Chủ studio",
    description: "Toàn quyền vận hành",
    pin: "0000",
    role: "owner" as const,
  },
  {
    label: "Nhân viên",
    description: "Thuê · trả · thu cọc",
    pin: "1111",
    role: "staff" as const,
  },
] as const;
