import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dfFormat, parseISO } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { readLang } from "@/lib/i18n/translate";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVnd(amount: number): string {
  const locale = readLang() === "en" ? "en-US" : "vi-VN";
  return `${Math.round(amount).toLocaleString(locale)}đ`;
}

/** Gợi ý VND khi gõ số ngắn (vd. 100 → 100.000 · 1.000.000 · 10.000.000). */
export function vndAmountSuggestions(raw: string, max = 3): number[] {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return [];
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return [];
  const out: number[] = [];
  for (const f of [1_000, 10_000, 100_000] as const) {
    const v = n * f;
    if (v === n || v > 999_999_999_999) continue;
    if (!out.includes(v)) out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

export function formatDate(iso: string, pattern = "dd/MM/yyyy"): string {
  try {
    return dfFormat(parseISO(iso), pattern, {
      locale: readLang() === "en" ? enUS : vi,
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, "dd/MM/yyyy HH:mm");
}

export function todayKey(d = new Date()): string {
  return dfFormat(d, "yyyy-MM-dd");
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function orderCode(seq: number, d = new Date()): string {
  return `DH-${dfFormat(d, "ddMMyy")}-${String(seq).padStart(3, "0")}`;
}
