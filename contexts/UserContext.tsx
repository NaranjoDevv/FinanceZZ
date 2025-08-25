"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

interface UserContextType {
  currentUser: any;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);
  
  // Auto-create user if signed in but no user exists in Convex
  useEffect(() => {
    if (isLoaded && isSignedIn && currentUser === null) {
      console.log("🔧 User signed in but not found in Convex, creating...");
      
      // Pequeño delay para asegurar que Clerk esté completamente inicializado
      const timer = setTimeout(() => {
        createUserIfNotExists()
          .then((result) => {
            if (result.created) {
              console.log("✅ New user created automatically");
            } else {
              console.log("ℹ️ User already existed");
            }
          })
          .catch((error) => {
            console.error("❌ Error creating user:", error);
          });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, currentUser, createUserIfNotExists]);

  const isLoading = !isLoaded || (isSignedIn && currentUser === undefined);

  return (
    <UserContext.Provider value={{ currentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a UserProvider");
  }
  return context;
};