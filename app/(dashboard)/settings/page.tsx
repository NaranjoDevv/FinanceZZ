"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { NumberRoundingSelector } from "@/components/ui/number-rounding-selector";
import { 
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  LockClosedIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Currency, toCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBilling } from "@/hooks/useBilling";
import { SubscriptionPopup } from "@/components/billing/SubscriptionPopup";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const user = useQuery(api.users.getCurrentUser);
  const updateCurrency = useMutation(api.users.updateUserCurrency);
  const migrateUserNumberRounding = useMutation(api.users.migrateUserNumberRounding);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [currentLimitType, setCurrentLimitType] = useState<'currency' | 'number_format'>('currency');
  
  // Billing verification
  const { isFree, checkCurrencyAccess } = useBilling();
  const isUserFree = isFree;

  // Migrar usuario si no tiene numberRounding
  useEffect(() => {
    if (user && user.numberRounding === undefined) {
      migrateUserNumberRounding();
    }
  }, [user, migrateUserNumberRounding]);

  const handleCurrencyChange = async (currency: Currency) => {
    if (!user || isUpdating) return;
    
    // Check if user has access to currency selection
    if (!checkCurrencyAccess()) {
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateCurrency({ currency });
      toast.success(`Moneda actualizada a ${currency}`);
    } catch (error) {
      toast.error("Error al actualizar la moneda");
      console.error("Error updating currency:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="px-6 py-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
          Configuración
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Personaliza tu experiencia
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Settings Sections */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Configuración de Moneda
            </h2>
            {isUserFree && (
              <div className="ml-auto flex items-center space-x-2">
                <LockClosedIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase">Premium</span>
              </div>
            )}
          </div>
          
          {isUserFree ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <LockClosedIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-black uppercase tracking-wide text-gray-700 mb-2">
                  Selector de Moneda - Premium
                </h3>
                <p className="text-sm text-gray-600 font-bold mb-4">
                  Los usuarios gratuitos utilizan Peso Colombiano (COP) por defecto.
                  Actualiza a Premium para seleccionar tu moneda preferida.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-700">Moneda actual: Peso Colombiano (COP)</span>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentLimitType('currency');
                    setShowSubscriptionPopup(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 font-black uppercase tracking-wide"
                >
                  <StarIcon className="w-4 h-4 mr-2" />
                  Actualizar a Premium
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 mb-2">
                  Moneda Principal
                </label>
                <CurrencySelector
                  value={toCurrency(user.currency || 'USD')}
                  onChange={handleCurrencyChange}
                  disabled={isUpdating}
                />
              </div>
              <p className="text-xs text-gray-500">
                Esta será la moneda utilizada para mostrar todos los montos en la aplicación.
              </p>
            </div>
          )}
        </Card>

        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <HashtagIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Formato de Números
            </h2>
            {isUserFree && (
              <div className="ml-auto flex items-center space-x-2">
                <LockClosedIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase">Premium</span>
              </div>
            )}
          </div>
          
          {isUserFree ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <LockClosedIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-black uppercase tracking-wide text-gray-700 mb-2">
                Formato de Números - Premium
              </h3>
              <p className="text-sm text-gray-600 font-bold mb-4">
                Los usuarios gratuitos utilizan formato de números estándar.
                Actualiza a Premium para personalizar el formato de números.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-blue-700">Formato actual: Números completos (ej: $1,234,567)</span>
                </div>
              </div>
              <Button 
                 onClick={() => {
                   setCurrentLimitType('number_format');
                   setShowSubscriptionPopup(true);
                 }}
                 className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 font-black uppercase tracking-wide"
               >
                 <StarIcon className="w-4 h-4 mr-2" />
                 Actualizar a Premium
               </Button>
            </div>
          ) : (
            <NumberRoundingSelector
              currentRounding={user.numberRounding || false}
              onRoundingChange={() => {
                // La actualización se maneja internamente en el componente
                // Aquí podríamos agregar lógica adicional si fuera necesario
              }}
            />
          )}
        </Card>

        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide text-black transition-colors duration-200">
              Notificaciones
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium transition-colors duration-200">
              Configuración de notificaciones próximamente
            </p>
          </div>
        </Card>

        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide text-black transition-colors duration-200">
              Seguridad
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium transition-colors duration-200">
              Configuraciones de seguridad próximamente
            </p>
          </div>
        </Card>
      </motion.div>
      
      {/* Popup de suscripción */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        limitType={currentLimitType}
      />
    </div>
  );
}