"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      routerPush={(to: string) => router.push(to)}
      routerReplace={(to: string) => router.replace(to)}
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
