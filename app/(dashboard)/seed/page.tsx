"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, Trash2 } from "lucide-react";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const seedData = useMutation(api.seed.seedData);
  const clearSeedData = useMutation(api.seed.clearSeedData);
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  // Crear usuario automáticamente si está autenticado en Clerk pero no existe en Convex
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (clerkUser && !currentUser && !isCreatingUser) {
        console.log("🔧 Creating user in Convex...", {
          clerkUser: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: clerkUser.fullName || clerkUser.firstName || 'Usuario'
          }
        });
        
        setIsCreatingUser(true);
        try {
          await createOrUpdateUser({
            tokenIdentifier: `https://capital-crane-46.clerk.accounts.dev|${clerkUser.id}`,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || 'Usuario',
            imageUrl: clerkUser.imageUrl
          });
          console.log("✅ User created successfully in Convex");
        } catch (error) {
          console.error("❌ Error creating user in Convex:", error);
        } finally {
          setIsCreatingUser(false);
        }
      }
    };
    
    createUserIfNeeded();
  }, [clerkUser, currentUser, createOrUpdateUser, isCreatingUser]);

  // Debug logs
  console.log("🔍 SeedPage Debug:", {
    clerkUser: clerkUser ? {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: clerkUser.fullName || clerkUser.firstName
    } : null,
    currentUser,
    isCurrentUserLoading: currentUser === undefined,
    hasCurrentUser: !!currentUser,
    currentUserId: currentUser?._id,
    isCreatingUser
  });

  const handleSeedData = async () => {
    console.log("🌱 handleSeedData called", { currentUser: currentUser?._id });
    
    if (!currentUser?._id) {
      console.error("❌ No currentUser._id found:", currentUser);
      setMessage("Error: Usuario no encontrado");
      return;
    }

    setIsSeeding(true);
    setMessage("");
    console.log("🚀 Starting seed data process...");

    try {
      const result = await seedData({ userId: currentUser._id });
      console.log("✅ Seed data success:", result);
      setMessage(`✅ ${result.message}`);
    } catch (error) {
      console.error("❌ Seed data error:", error);
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsSeeding(false);
      console.log("🏁 Seed data process finished");
    }
  };

  const handleClearData = async () => {
    console.log("🗑️ handleClearData called", { currentUser: currentUser?._id });
    
    if (!currentUser?._id) {
      console.error("❌ No currentUser._id found for clear:", currentUser);
      setMessage("Error: Usuario no encontrado");
      return;
    }

    setIsClearing(true);
    setMessage("");
    console.log("🚀 Starting clear data process...");

    try {
      const result = await clearSeedData({ userId: currentUser._id });
      console.log("✅ Clear data success:", result);
      setMessage(`✅ ${result.message}`);
    } catch (error) {
      console.error("❌ Clear data error:", error);
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsClearing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="px-6 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{isCreatingUser ? "Configurando usuario..." : "Cargando usuario..."}</p>
          {clerkUser && (
            <p className="text-sm text-gray-600 mt-2">
              Usuario de Clerk: {clerkUser.emailAddresses[0]?.emailAddress}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
            Datos de Ejemplo
          </h1>
          <p className="text-gray-600 font-medium">
            Crea o elimina datos de ejemplo para probar la aplicación
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Crear Datos de Ejemplo
              </CardTitle>
              <CardDescription>
                Esto creará categorías y transacciones de ejemplo para tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="w-full bg-green-400 hover:bg-green-500 border-2 border-black font-bold uppercase tracking-wide"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  "Crear Datos de Ejemplo"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Limpiar Datos
              </CardTitle>
              <CardDescription>
                Esto eliminará todas las categorías y transacciones de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleClearData}
                disabled={isClearing}
                variant="destructive"
                className="w-full border-2 border-black font-bold uppercase tracking-wide"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Eliminando...
                  </>
                ) : (
                  "Limpiar Todos los Datos"
                )}
              </Button>
            </CardContent>
          </Card>

          {message && (
            <Card className="border-4 border-black shadow-brutal">
              <CardContent className="pt-6">
                <p className="text-center font-medium">{message}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}