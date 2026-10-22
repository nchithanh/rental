"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db, getDbName } from "@/lib/db";
import { notify } from "@/lib/notify";
import {
  VERTICAL_OPTIONS,
  setVertical,
  useVertical,
  type VerticalId,
} from "@/lib/vertical";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get("store"));
  const vertical = useVertical();
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setSlogan(settings.slogan);
    setPhone(settings.phone);
    setAddress(settings.address);
  }, [settings]);

  const save = async () => {
    await db.settings.put({
      id: "store",
      name: name.trim() || "Studio Thuê",
      slogan,
      phone,
      address,
      zaloNotifyEnabled: settings?.zaloNotifyEnabled ?? false,
      websiteShowcaseTodo: true,
    });
    notify.success("Đã lưu cài đặt");
  };

  const changeVertical = (id: VerticalId) => {
    if (id === vertical) return;
    if (
      !window.confirm(
        "Đổi lĩnh vực sẽ tải lại app với data riêng (IndexedDB tách). Tiếp tục?",
      )
    ) {
      return;
    }
    logout();
    setVertical(id);
  };

  return (
    <AppShell>
      <h1 className="mb-1 text-lg font-bold">Cài đặt</h1>
      <p className="mb-4 text-sm text-slate-500">Thông tin cửa hàng / studio</p>

      <Card className="mb-4 space-y-2 p-4">
        <p className="text-sm font-semibold">Lĩnh vực</p>
        <div className="grid grid-cols-2 gap-2">
          {VERTICAL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = vertical === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => changeVertical(opt.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-[10px] border px-3 py-2.5 text-left text-sm",
                  active
                    ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
                    : "border-slate-200",
                )}
              >
                <Icon size={18} />
                <span className="font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <Input
          placeholder="Tên cửa hàng"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Slogan"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
        />
        <Input
          placeholder="SĐT"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          placeholder="Địa chỉ"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button className="w-full" onClick={() => void save()}>
          Lưu
        </Button>
      </Card>

      <Card className="mt-4 p-4 text-sm text-slate-500">
        <p>
          DB local: <code>{getDbName()}</code>
        </p>
        <p>Demo PIN: 0000 (chủ) · 1111 (NV)</p>
      </Card>
    </AppShell>
  );
}
