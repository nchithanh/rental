import type { ReactNode } from "react";
import { customerStaticParams } from "@/lib/pages-static-params";

export function generateStaticParams() {
  return customerStaticParams();
}

export default function CustomerDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
