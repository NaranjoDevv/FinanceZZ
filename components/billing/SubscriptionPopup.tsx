"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap } from "lucide-react";

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "transactions" | "debts" | "recurring_transactions" | "categories" | "contacts" | "reports" | "currency" | "number_format";
  currentUsage?: number;
  limit?: number;
}

const limitMessages = {
  transactions: {
    title: "Límite de Transacciones Alcanzado",
    description: "Has alcanzado el límite de 10 transacciones por mes del plan gratuito.",
    icon: "💳"
  },
  debts: {
    title: "Límite de Deudas Alcanzado",
    description: "Has alcanzado el límite de 3 deudas activas del plan gratuito.",
    icon: "💰"
  },
  recurring_transactions: {
    title: "Límite de Transacciones Recurrentes",
    description: "Has alcanzado el límite de 2 transacciones recurrentes del plan gratuito.",
    icon: "🔄"
  },
  categories: {
    title: "Límite de Categorías Alcanzado",
    description: "Has alcanzado el límite de 3 categorías personalizadas del plan gratuito.",
    icon: "🏷️"
  },
  contacts: {
    title: "Módulo de Contactos Premium",
    description: "El módulo de contactos está disponible solo para usuarios Premium.",
    icon: "👥"
  },
  reports: {
    title: "Reportes Avanzados Premium",
    description: "Los reportes avanzados y gráficos están disponibles solo para usuarios Premium.",
    icon: "📈"
  },
  currency: {
    title: "Selector de Moneda Premium",
    description: "La personalización de moneda está disponible solo para usuarios Premium. Los usuarios gratuitos usan COP.",
    icon: "💱"
  },
  number_format: {
    title: "Formato de Números Premium",
    description: "La personalización del formato de números está disponible solo para usuarios Premium.",
    icon: "🔢"
  }
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
  "Soporte prioritario"
];

const freeFeatures = [
  "10 transacciones por mes",
  "1 deuda activa",
  "2 transacciones recurrentes",
  "2 categorías personalizadas",
  "Reporte básico de transacciones",
  "Moneda fija (COP)"
];

export function SubscriptionPopup({ isOpen, onClose, limitType, currentUsage, limit }: SubscriptionPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const limitInfo = limitMessages[limitType];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando proceso de pago para plan Premium...");
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'premium' })
      });
      
      if (!response.ok) {
        throw new Error('Error creating checkout session');
      }
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error("Error creando sesión de pago:", error);
      alert("Error al procesar el pago. Intenta nuevamente.");
      setIsLoading(false);
    }
    // Don't set loading to false here as we're redirecting
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{limitInfo.icon}</div>
            <div>
              <DialogTitle className="text-xl font-bold">{limitInfo.title}</DialogTitle>
              <p className="text-muted-foreground mt-1">{limitInfo.description}</p>
            </div>
          </div>
        </DialogHeader>

        {currentUsage !== undefined && limit !== undefined && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium">Uso actual:</span>
              <Badge variant="outline" className="bg-orange-100">
                {currentUsage} / {limit}
              </Badge>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Actual - Gratuito */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Plan Gratuito</span>
                  <Badge variant="secondary">Actual</Badge>
                </CardTitle>
                <div className="text-2xl font-bold">$0</div>
              </div>
              <CardDescription>Tu plan actual con limitaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  ❌ Sin acceso a contactos<br/>
                  ❌ Reportes limitados<br/>
                  ❌ Sin personalización de moneda<br/>
                  ❌ Sin exportación de datos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold">
              RECOMENDADO
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span>Plan Premium</span>
              </CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <CardDescription>Desbloquea todo el potencial de tu gestión financiera</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-900"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Actualizar a Premium
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    💳 Pago seguro con Stripe • Cancela cuando quieras
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Continuar con Plan Gratuito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}