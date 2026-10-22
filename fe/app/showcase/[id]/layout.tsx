import type { ReactNode } from "react";
import { garmentStaticParams } from "@/lib/pages-static-params";

export function generateStaticParams() {
  return garmentStaticParams();
}

export default function ShowcaseDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
