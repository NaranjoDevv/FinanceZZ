"use client";

import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useRouter } from "next/navigation";

// Inicializa el cliente Convex usando tu URL pública
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      routerPush={(to: string) => router.push(to)}
      routerReplace={(to: string) => router.replace(to)}
    >
      <ConvexWithClerk>{children}</ConvexWithClerk>
    </ClerkProvider>
  );
}

function ConvexWithClerk({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <ConvexProviderWithClerk
      client={convex}
      useAuth={() => ({
        ...auth,
        getToken: (opts?: { template?: string }) => auth.getToken({ template: "convex", ...opts }),
      })}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}
