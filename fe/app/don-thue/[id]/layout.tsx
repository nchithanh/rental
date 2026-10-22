import type { ReactNode } from "react";
import { orderStaticParams } from "@/lib/pages-static-params";

export function generateStaticParams() {
  return orderStaticParams();
}

export default function OrderDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
