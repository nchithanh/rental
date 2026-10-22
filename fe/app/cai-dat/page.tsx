"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { db, getDbName } from "@/lib/db";
import { notify } from "@/lib/notify";
import {
  getAttributeDefs,
  getAttributeGroups,
} from "@/lib/attribute-defs";
import {
  VERTICAL_OPTIONS,
  setVertical,
  useVertical,
  type VerticalId,
} from "@/lib/vertical";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function resolvePublicUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${basePath}${url.startsWith("/") ? url : `/${url}`}`;
}

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get("store"));
  const vertical = useVertical();
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [sub, setSub] = useState("");
  const [badge, setBadge] = useState("");

  useEffect(() => {
    if (!settings) return;
    setName(settings.name);
    setSlogan(settings.slogan);
    setPhone(settings.phone);
    setAddress(settings.address);
    setBannerUrl(settings.showcaseBannerUrl ?? "/showcase-banner.jpg");
    setHeadline(settings.showcaseHeadline ?? "");
    setSub(settings.showcaseSub ?? "");
    setBadge(settings.showcaseBadge ?? "");
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
      showcaseBannerUrl: bannerUrl.trim() || "/showcase-banner.jpg",
      showcaseHeadline: headline.trim(),
      showcaseSub: sub.trim(),
      showcaseBadge: badge.trim(),
      branchName: settings?.branchName,
      branches: settings?.branches,
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

  const previewSrc = resolvePublicUrl(bannerUrl.trim() || "/showcase-banner.jpg");

  return (
    <AppShell>
      <PageHeader
        title="Cài đặt"
        description="Thông tin cửa hàng / studio"
      />

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
          placeholder="Tên cửa hàng / showroom"
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
      </Card>

      <Card className="mt-4 space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">Banner trang trưng bày</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Ảnh hero + copy trên{" "}
            <a
              href={`${basePath}/showcase`}
              className="font-semibold text-[var(--brand-600)] underline-offset-2 hover:underline"
            >
              /showcase
            </a>
            . Path public (vd.{" "}
            <code className="text-[11px]">/showcase-banner.jpg</code>) hoặc URL
            đầy đủ.
          </p>
        </div>
        {previewSrc ? (
          <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--brand-50)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Xem trước banner"
              className="h-36 w-full object-cover"
            />
          </div>
        ) : null}
        <Input
          placeholder="URL ảnh banner"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
        />
        <Input
          placeholder="Headline hero"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
        <Input
          placeholder="Dòng phụ (sang trọng · thanh lịch…)"
          value={sub}
          onChange={(e) => setSub(e.target.value)}
        />
        <textarea
          className="min-h-20 w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-500)]"
          placeholder="Badge ưu tiên / cập nhật mẫu"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
        />
        <Button className="w-full" onClick={() => void save()}>
          Lưu
        </Button>
      </Card>

      <Card className="mt-4 space-y-3 p-4">
        <p className="text-sm font-semibold">Thuộc tính lĩnh vực</p>
        <p className="text-xs text-slate-500">
          Mỗi lĩnh vực có bộ thuộc tính theo nhóm (đặc điểm, mô tả, tiện nghi,
          giấy tờ, thế chấp, điều khoản). Tạm hardcode — TODO: CRUD sau.
        </p>
        {getAttributeGroups(vertical).map((group) => (
          <div key={group.id}>
            <p className="mb-1.5 text-xs font-bold text-slate-500">
              {group.label}
              {group.hint ? (
                <span className="ml-1 font-normal text-slate-400">
                  · {group.hint}
                </span>
              ) : null}
            </p>
            <ul className="space-y-1">
              {getAttributeDefs(vertical)
                .filter((d) => d.group === group.id)
                .map((def) => (
                  <li
                    key={def.key}
                    className="flex items-center justify-between rounded-[10px] border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                  >
                    <span>
                      <span className="font-semibold">{def.label}</span>
                      <span className="ml-2 text-[11px] text-slate-400">
                        {def.key}
                        {def.kind && def.kind !== "text"
                          ? ` · ${def.kind}`
                          : ""}
                      </span>
                    </span>
                    {def.filterable ? (
                      <span className="rounded-full bg-[var(--brand-50)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)]">
                        Filter
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Chi tiết</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
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
