"use client";

import React, { useEffect, useState } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

interface ConvexClientProviderProps {
  children: React.ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  useEffect(() => {
    try {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      
      if (!convexUrl) {
        setError(
          "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
          "Please configure it in your deployment settings."
        );
        return;
      }
      
      const client = new ConvexReactClient(convexUrl);
      setConvexClient(client);
    } catch (err) {
      setError(`Failed to initialize Convex client: ${err}`);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-6 bg-white border border-red-200 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">Configuration Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">To fix this:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Set NEXT_PUBLIC_CONVEX_URL in your environment variables</li>
              <li>For Vercel: Add it in your project settings</li>
              <li>For local development: Add it to .env.local</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!convexClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Convex...</p>
        </div>
      </div>
    );
  }

  return (
    <ConvexProviderWithClerk
      client={convexClient}
      useAuth={() => ({
        ...auth,
        getToken: (opts?: { template?: string }) => auth.getToken({ template: "convex", ...opts }),
      })}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}