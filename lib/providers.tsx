"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { UserProvider } from "@/contexts/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexClientProvider>
        <UserProvider>{children}</UserProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
