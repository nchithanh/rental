"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import {
  VERTICAL_OPTIONS,
  readVertical,
  setVertical,
  type VerticalId,
} from "@/lib/vertical";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const loginWithPin = useAuthStore((s) => s.loginWithPin);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [vertical, setVerticalLocal] = useState<VerticalId>(() =>
    typeof window === "undefined" ? "trang-phuc" : readVertical(),
  );

  const pickVertical = (id: VerticalId) => {
    if (id === readVertical()) {
      setVerticalLocal(id);
      return;
    }
    setVerticalLocal(id);
    setVertical(id);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPin(pin);
      notify.success("Đăng nhập thành công");
      router.replace("/");
    } catch (err) {
      notify.fromError(err, "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const current = VERTICAL_OPTIONS.find((o) => o.id === vertical);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[var(--brand-50)] via-white to-slate-100 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <BrandMark className="mx-auto mb-3 h-14 w-14" />
          <h1 className="text-2xl font-bold">
            {current?.appTitle ?? "Dolphin Rental"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {current?.description ?? "Cho thuê · nhận · trả · cọc"}
          </p>
        </div>

        <div className="mb-5 space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Lĩnh vực
          </p>
          <div className="grid grid-cols-2 gap-2">
            {VERTICAL_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = vertical === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pickVertical(opt.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-[10px] border px-3 py-3 text-left text-sm transition",
                    active
                      ? "border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)]"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-[11px] leading-snug text-slate-500">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-500">
              PIN (4 số)
            </span>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="0000"
              autoFocus
            />
          </label>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || pin.length < 4}
          >
            {loading ? "Đang vào…" : "Đăng nhập"}
          </Button>
        </form>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Chọn chức vụ demo
          </p>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.pin}
              type="button"
              className="flex w-full items-center justify-between rounded-[10px] border border-slate-200 px-3 py-2.5 text-left text-sm transition hover:bg-[var(--brand-50)]"
              onClick={() => setPin(acc.pin)}
            >
              <span>
                <span className="block font-semibold text-slate-800">
                  {acc.label}
                </span>
                <span className="text-xs text-slate-500">{acc.description}</span>
              </span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                PIN {acc.pin}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
