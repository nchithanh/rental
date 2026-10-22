/** IDs seed demo — pre-render cho `output: "export"` (GitHub Pages). */

function range(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
  }));
}

/** Trang phục / xe seed: `g1`… */
export function garmentStaticParams() {
  return range("g", 60);
}

/** Khách: `c1`…`c10` */
export function customerStaticParams() {
  return range("c", 10);
}

/** Đơn thuê: `o1`…`o15` */
export function orderStaticParams() {
  return range("o", 15);
}
