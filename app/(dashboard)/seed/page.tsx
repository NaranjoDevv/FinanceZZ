"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, BarChart3, AlertTriangle, Target } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isPercentageSeeding, setIsPercentageSeeding] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { billingInfo, isFree, isPremium } = useBilling();
  
  // Mutations
  const seedData = useMutation(api.seed.seedData);
  const clearSeedData = useMutation(api.seed.clearSeedData);
  const seedDataWithPercentage = useMutation(api.seed.seedDataWithPercentage);
  const fillToLimit = useMutation(api.seed.fillToLimit);
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
    isCreatingUser,
    billingInfo
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

  const handlePercentageSeed = async (percentage: number) => {
    if (!currentUser?._id) {
      setMessage("Error: Usuario no encontrado");
      return;
    }

    if (isPremium) {
      setMessage("⚠️ Los controles de porcentaje son solo para usuarios del plan gratuito");
      return;
    }

    setIsPercentageSeeding(percentage);
    setMessage("");

    try {
      const result = await seedDataWithPercentage({ 
        userId: currentUser._id, 
        percentage 
      });
      setMessage(`✅ ${result.message}\n\nCreado:\n${Object.entries(result.percentageResults)
        .map(([key, value]) => `• ${key}: ${value}`)
        .join('\n')}`);
    } catch (error) {
      console.error("❌ Percentage seed error:", error);
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsPercentageSeeding(null);
    }
  };

  const handleFillToLimit = async () => {
    if (!currentUser?._id) {
      setMessage("Error: Usuario no encontrado");
      return;
    }

    if (isPremium) {
      setMessage("⚠️ Los controles de límite son solo para usuarios del plan gratuito");
      return;
    }

    setIsPercentageSeeding(100);
    setMessage("");

    try {
      const result = await fillToLimit({ userId: currentUser._id });
      setMessage(`✅ ${result.message}\n\nCreado:\n${Object.entries(result.percentageResults)
        .map(([key, value]) => `• ${key}: ${value}`)
        .join('\n')}`);
    } catch (error) {
      console.error("❌ Fill to limit error:", error);
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsPercentageSeeding(null);
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

  const percentageButtons = [20, 50, 80, 100];

  return (
    <div className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
            Datos de Ejemplo
          </h1>
          <p className="text-gray-600 font-medium">
            Crea o elimina datos de ejemplo para probar la aplicación
          </p>
          <div className="w-full h-1 bg-black mt-4 mb-6"></div>
          
          {/* Plan Status */}
          {billingInfo && (
            <div className={`mb-6 p-4 border-2 border-black ${
              isFree ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <p className="font-bold uppercase">
                Plan Actual: {billingInfo.plan.toUpperCase()}
              </p>
              {isFree && (
                <p className="text-sm text-gray-700 mt-1">
                  Los controles de porcentaje están disponibles para probar los límites del plan gratuito
                </p>
              )}
              {isPremium && (
                <p className="text-sm text-gray-700 mt-1">
                  Como usuario premium, tienes acceso ilimitado. Los controles de porcentaje están deshabilitados.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {/* Basic Seed Controls */}
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Controles Básicos
              </CardTitle>
              <CardDescription>
                Crear o eliminar datos de ejemplo estándar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Percentage Controls - Only for Free Plan */}
          {isFree && (
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Controles de Porcentaje de Uso
                </CardTitle>
                <CardDescription>
                  Crea datos hasta un porcentaje específico de tus límites para probar restricciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {percentageButtons.map((percentage) => (
                    <Button
                      key={percentage}
                      onClick={() => handlePercentageSeed(percentage)}
                      disabled={isPercentageSeeding !== null}
                      className={`border-2 border-black font-bold uppercase tracking-wide ${
                        percentage === 20 ? 'bg-blue-200 hover:bg-blue-300' :
                        percentage === 50 ? 'bg-yellow-200 hover:bg-yellow-300' :
                        percentage === 80 ? 'bg-orange-200 hover:bg-orange-300' :
                        'bg-red-200 hover:bg-red-300'
                      }`}
                    >
                      {isPercentageSeeding === percentage ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {percentage}%
                        </>
                      ) : (
                        `${percentage}%`
                      )}
                    </Button>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>20%:</strong> Uso mínimo para pruebas básicas</p>
                  <p><strong>50%:</strong> Uso moderado, buen punto de prueba</p>
                  <p><strong>80%:</strong> Cerca del límite, activará advertencias</p>
                  <p><strong>100%:</strong> En el límite exacto, bloqueará nuevas acciones</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fill to Limit Control - Only for Free Plan */}
          {isFree && (
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Control de Límite Completo
                </CardTitle>
                <CardDescription>
                  Llena tu cuenta hasta el límite exacto para probar todas las restricciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleFillToLimit}
                  disabled={isPercentageSeeding !== null}
                  className="w-full bg-red-400 hover:bg-red-500 border-2 border-black font-bold uppercase tracking-wide"
                >
                  {isPercentageSeeding === 100 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Llenando...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Llenar Hasta el Límite
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ Esto llenará tu cuenta al 100% de todos los límites del plan gratuito
                </p>
              </CardContent>
            </Card>
          )}

          {/* Current Usage Display */}
          {billingInfo && isFree && (
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Uso Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Transacciones:</span>
                      <span>{billingInfo.usage.monthlyTransactions}/{billingInfo.limits.monthlyTransactions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (billingInfo.usage.monthlyTransactions / billingInfo.limits.monthlyTransactions) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Categorías:</span>
                      <span>{billingInfo.usage.categories}/{billingInfo.limits.categories}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (billingInfo.usage.categories / billingInfo.limits.categories) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Recurrentes:</span>
                      <span>{billingInfo.usage.recurringTransactions}/{billingInfo.limits.recurringTransactions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (billingInfo.usage.recurringTransactions / billingInfo.limits.recurringTransactions) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Deudas:</span>
                      <span>{billingInfo.usage.activeDebts}/{billingInfo.limits.activeDebts}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (billingInfo.usage.activeDebts / billingInfo.limits.activeDebts) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Display */}
          {message && (
            <Card className="border-4 border-black shadow-brutal bg-white">
              <CardContent className="pt-6">
                <div className={`p-4 border-2 border-black font-bold ${
                  message.includes('✅') ? 'bg-green-100 text-green-800' :
                  message.includes('❌') ? 'bg-red-100 text-red-800' :
                  message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <pre className="whitespace-pre-wrap font-mono text-sm">{message}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}