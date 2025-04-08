"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX, useState } from "react";

export default function Providers({ children }: { children: JSX.Element }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
