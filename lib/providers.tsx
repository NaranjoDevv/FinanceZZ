"use client";

import React from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// Inicializa el cliente Convex usando tu URL pública
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
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
        getToken: (opts?: any) => auth.getToken({ template: "convex", ...opts }),
      })}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}
