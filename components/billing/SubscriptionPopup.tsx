"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  XMarkIcon,
  CheckIcon,
  CreditCardIcon,
  BoltIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { BrutalButton } from "../brutal";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limitType:
    | "transactions"
    | "debts"
    | "recurring_transactions"
    | "categories"
    | "contacts"
    | "reports"
    | "currency"
    | "number_format";
  currentUsage?: number;
  limit?: number;
}

const limitMessages = {
  transactions: {
    title: "LÍMITE DE TRANSACCIONES ALCANZADO",
    description:
      "Has alcanzado el límite de 10 transacciones por mes del plan gratuito.",
    icon: CreditCardIcon,
  },
  debts: {
    title: "LÍMITE DE DEUDAS ALCANZADO",
    description:
      "Has alcanzado el límite de 3 deudas activas del plan gratuito.",
    icon: CreditCardIcon,
  },
  recurring_transactions: {
    title: "LÍMITE DE TRANSACCIONES RECURRENTES",
    description:
      "Has alcanzado el límite de 2 transacciones recurrentes del plan gratuito.",
    icon: BoltIcon,
  },
  categories: {
    title: "LÍMITE DE CATEGORÍAS ALCANZADO",
    description:
      "Has alcanzado el límite de 3 categorías personalizadas del plan gratuito.",
    icon: SparklesIcon,
  },
  contacts: {
    title: "MÓDULO DE CONTACTOS PREMIUM",
    description:
      "El módulo de contactos está disponible solo para usuarios Premium.",
    icon: SparklesIcon,
  },
  reports: {
    title: "REPORTES AVANZADOS PREMIUM",
    description:
      "Los reportes avanzados y gráficos están disponibles solo para usuarios Premium.",
    icon: SparklesIcon,
  },
  currency: {
    title: "SELECTOR DE MONEDA PREMIUM",
    description:
      "La personalización de moneda está disponible solo para usuarios Premium. Los usuarios gratuitos usan COP.",
    icon: SparklesIcon,
  },
  number_format: {
    title: "FORMATO DE NÚMEROS PREMIUM",
    description:
      "La personalización del formato de números está disponible solo para usuarios Premium.",
    icon: SparklesIcon,
  },
};

const premiumFeatures = [
  "Transacciones ilimitadas",
  "Deudas ilimitadas",
  "Transacciones recurrentes ilimitadas",
  "Categorías ilimitadas",
  "Módulo de contactos completo",
  "Suite completa de reportes",
  "Selector de moneda",
  "Personalización de formato",
  "Exportación de datos",
  "Soporte prioritario",
];

const freeFeatures = [
  "10 transacciones por mes",
  "1 deuda activa",
  "2 transacciones recurrentes",
  "2 categorías personalizadas",
  "Reporte básico de transacciones",
  "Moneda fija (COP)",
];

export function SubscriptionPopup({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  limit,
}: SubscriptionPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const limitInfo = limitMessages[limitType];
  const IconComponent = limitInfo.icon;

  const handleClose = () => onClose();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });

      if (!response.ok) throw new Error("Error creating checkout session");

      const { url } = await response.json();
      if (url) window.location.href = url;
      else throw new Error("No checkout URL received");
    } catch (error) {
      console.error("Error creando sesión de pago:", error);
      alert("Error al procesar el pago. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm sm:max-w-4xl lg:max-w-6xl my-4 sm:my-8"
          >
            <Card className="brutal-card flex flex-col">
              {/* Header con límite */}
              <div className="flex-shrink-0 p-3 sm:p-6 border-b-4 border-black bg-white">
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-3 bg-yellow-500 text-black border-2 sm:border-4 border-black">
                      <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-black uppercase tracking-wide">
                        ACTUALIZAR PLAN
                      </h2>
                      <p className="text-xs sm:text-sm font-black text-gray-700 uppercase hidden sm:block">
                        {limitInfo.title}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    size="sm"
                    className="border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {currentUsage !== undefined && limit !== undefined && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 border-4 border-red-600 bg-red-50">
                    <span className="font-black text-black uppercase text-xs sm:text-sm">
                      USO ACTUAL: {currentUsage}/{limit}
                    </span>
                    <div className="w-full sm:w-40 h-3 bg-red-200 border-2 border-red-600">
                      <div
                        className="bg-red-600 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min((currentUsage / limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content - sin scroll en desktop */}
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Plan Free */}
                  <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-4 border-b-4 border-black bg-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-xl text-black uppercase">
                          PLAN GRATUITO
                        </h3>
                        <div className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs uppercase">
                          ACTUAL
                        </div>
                      </div>
                      <div className="font-black text-3xl text-black">$0</div>
                      <p className="font-bold text-sm text-gray-700 uppercase">
                        TU PLAN ACTUAL CON LIMITACIONES
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <ul className="space-y-2">
                        {freeFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckIcon className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-bold text-black">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex-shrink-0 flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <BrutalButton
                  onClick={handleClose}
                  variant="success"
                  className="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide"
                >
                  CONTINUAR CON PLAN GRATUITO
                </BrutalButton>
              </div>
                  </div>

                  {/* Plan Premium */}
                  <div className="border-4 border-yellow-500 bg-white shadow-[8px_8px_0px_0px_rgba(234,179,8,1)] relative">
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-4 py-2 font-black text-sm uppercase border-4 border-black shadow">
                      ¡RECOMENDADO!
                    </div>
                    <div className="p-4 border-b-4 border-yellow-500 bg-yellow-100">
                      <div className="flex items-center gap-3 mb-3">
                        <StarIcon className="h-8 w-8 text-yellow-600" />
                        <h3 className="font-black text-2xl text-black uppercase">
                          PLAN PREMIUM
                        </h3>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-4xl text-black">
                          $9.99
                        </span>
                        <span className="font-black text-lg text-gray-700 uppercase">
                          /MES
                        </span>
                      </div>
                      <p className="font-black text-sm text-yellow-700 uppercase mt-2">
                        DESBLOQUEA TODO EL POTENCIAL DE TU GESTIÓN FINANCIERA
                      </p>
                    </div>
                    <div className="p-4 space-y-4">
                      <ul className="space-y-2">
                        {premiumFeatures.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckIcon className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-black text-black uppercase">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                     
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <BrutalButton
                        onClick={handleUpgrade}
                        variant="success"
                        disabled={isLoading}
                        className="w-full py-4 bg-yellow-500 text-black border-4 border-black font-black text-lg hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] uppercase tracking-wide disabled:opacity-50"
                      >
                        {isLoading ? "PROCESANDO..." : "ACTUALIZAR A PREMIUM"}
                      </BrutalButton>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
