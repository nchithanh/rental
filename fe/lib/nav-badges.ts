"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { orderBalance } from "@/lib/rental";

/** Số badge theo href nav — 0 = ẩn. */
export function useNavBadges(): Record<string, number> {
  const orders = useLiveQuery(() => db.orders.toArray());
  const garments = useLiveQuery(() => db.garments.toArray());

  return useMemo(() => {
    const list = orders ?? [];
    const stock = garments ?? [];
    let openOrders = 0;
    let overdue = 0;
    let renting = 0;
    let unpaid = 0;
    for (const o of list) {
      if (o.status === "cancelled" || o.status === "returned") continue;
      openOrders += 1;
      if (o.status === "renting") renting += 1;
      const bal = orderBalance(o);
      if (bal.overdue) overdue += 1;
      if (bal.dueRent > 0) unpaid += 1;
    }
    const careStock = stock.filter(
      (g) =>
        g.active &&
        (g.status === "laundry" ||
          g.status === "repair" ||
          g.status === "awaiting_return"),
    ).length;

    return {
      "/don-thue": openOrders,
      "/tra-do": renting,
      "/trang-phuc": careStock,
      "/thanh-toan": unpaid,
      "/cham-soc": overdue,
    };
  }, [orders, garments]);
}
