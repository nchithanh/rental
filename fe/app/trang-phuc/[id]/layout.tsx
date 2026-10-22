import type { ReactNode } from "react";
import { garmentStaticParams } from "@/lib/pages-static-params";

export function generateStaticParams() {
  return garmentStaticParams();
}

export default function GarmentDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
