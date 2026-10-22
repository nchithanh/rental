"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, RentalLine } from "@/types";
import { todayKey } from "@/lib/utils";

interface RentalCartState {
  lines: RentalLine[];
  customerId?: string;
  startDate: string;
  endDate: string;
  note: string;
  status: OrderStatus;
  addGarment: (line: RentalLine) => void;
  removeGarment: (garmentId: string) => void;
  updateLine: (
    garmentId: string,
    patch: Partial<Pick<RentalLine, "rentPrice" | "deposit">>,
  ) => void;
  setCustomerId: (id?: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setNote: (note: string) => void;
  setStatus: (status: OrderStatus) => void;
  clear: () => void;
  has: (garmentId: string) => boolean;
}

export const useRentalCartStore = create<RentalCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      customerId: undefined,
      startDate: todayKey(),
      endDate: todayKey(),
      note: "",
      status: "scheduled",

      addGarment: (line) => {
        if (get().lines.some((l) => l.garmentId === line.garmentId)) return;
        set({ lines: [...get().lines, line] });
      },

      removeGarment: (garmentId) =>
        set({
          lines: get().lines.filter((l) => l.garmentId !== garmentId),
        }),

      updateLine: (garmentId, patch) =>
        set({
          lines: get().lines.map((l) =>
            l.garmentId === garmentId ? { ...l, ...patch } : l,
          ),
        }),

      setCustomerId: (id) => set({ customerId: id }),
      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setNote: (note) => set({ note }),
      setStatus: (status) => set({ status }),

      clear: () =>
        set({
          lines: [],
          customerId: undefined,
          startDate: todayKey(),
          endDate: todayKey(),
          note: "",
          status: "scheduled",
        }),

      has: (garmentId) => get().lines.some((l) => l.garmentId === garmentId),
    }),
    {
      name: "dolphin-rental-cart",
      partialize: (s) => ({
        lines: s.lines,
        customerId: s.customerId,
        startDate: s.startDate,
        endDate: s.endDate,
        note: s.note,
        status: s.status,
      }),
    },
  ),
);
