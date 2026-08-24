"use client";

import type { ReactNode } from "react";

/*
  Cart was removed sitewide — every buy path links straight to Shopify
  checkout, so there is no client cart state left to provide.
*/
export default function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
