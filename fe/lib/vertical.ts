"use client";

import { useSyncExternalStore } from "react";
import {
  VERTICAL_EVENT,
  getVerticalCopy,
  readVertical,
  type VerticalCopy,
  type VerticalId,
} from "@/lib/vertical-core";

export type { VerticalId, VerticalCopy };
export {
  VERTICAL_STORAGE_KEY,
  VERTICAL_EVENT,
  VERTICAL_OPTIONS,
  isVerticalId,
  readVertical,
  getVerticalCopy,
  setVertical,
} from "@/lib/vertical-core";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(VERTICAL_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(VERTICAL_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useVertical(): VerticalId {
  return useSyncExternalStore(subscribe, readVertical, () => "trang-phuc");
}

export function useVerticalCopy(): VerticalCopy {
  const id = useVertical();
  return getVerticalCopy(id);
}
