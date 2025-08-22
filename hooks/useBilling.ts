"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type LimitType = "transactions" | "debts" | "recurring_transactions" | "categories" | "contacts" | "reports" | "currency" | "number_format";

export interface UserLimits {
  monthlyTransactions: number;
  activeDebts: number;
  recurringTransactions: number;
  categories: number;
}

export interface UserUsage {
  monthlyTransactions: number;
  activeDebts: number;
  recurringTransactions: number;
  categories: number;
}

export interface BillingInfo {
  plan: "free" | "premium";
  planExpiry?: number;
  limits: UserLimits;
  usage: UserUsage;
}

export function useBilling() {
  const { user } = useUser();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [currentLimitType, setCurrentLimitType] = useState<LimitType>("transactions");

  // Obtener usuario actual
  const currentUser = useQuery(api.users.getCurrentUser);

  // Obtener información de facturación del usuario
  const billingInfo = useQuery(
    api.users.getUserBillingInfo,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Verificar límites antes de realizar una acción
  const checkLimits = useMutation(api.users.checkUserLimits);
  
  // Incrementar uso
  const incrementUsage = useMutation(api.users.incrementUsage);
  
  // Decrementar uso
  const decrementUsage = useMutation(api.users.decrementUsage);

  const isPremium = billingInfo?.plan === "premium";
  const isFree = billingInfo?.plan === "free";

  // Verificar si el usuario puede realizar una acción específica
  const canPerformAction = async (limitType: LimitType): Promise<boolean> => {
    if (!currentUser?._id || isPremium) return true;
    
    // Para tipos que no requieren verificación en DB, bloquear directamente para usuarios gratuitos
    const featureOnlyTypes: LimitType[] = ["contacts", "reports", "currency", "number_format"];
    if (featureOnlyTypes.includes(limitType)) {
      setCurrentLimitType(limitType);
      setShowSubscriptionPopup(true);
      return false;
    }
    
    try {
      const result = await checkLimits({
        userId: currentUser._id,
        limitType: limitType as "transactions" | "debts" | "recurring_transactions" | "categories"
      });
      
      if (!result.canProceed) {
        setCurrentLimitType(limitType);
        setShowSubscriptionPopup(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking limits:", error);
      return false;
    }
  };

  // Incrementar el uso de un recurso
  const trackUsage = async (limitType: LimitType, increment: number = 1): Promise<void> => {
    if (!currentUser?._id || isPremium) return;
    
    // Solo rastrear tipos que requieren verificación en DB
    const trackableTypes: LimitType[] = ["transactions", "debts", "recurring_transactions", "categories"];
    if (!trackableTypes.includes(limitType)) return;
    
    try {
      await incrementUsage({
        userId: currentUser._id,
        limitType: limitType as "transactions" | "debts" | "recurring_transactions" | "categories",
        increment
      });
    } catch (error) {
      console.error("Error tracking usage:", error);
    }
  };

  // Decrementar el uso de un recurso
  const reduceUsage = async (limitType: LimitType, decrement: number = 1): Promise<void> => {
    if (!currentUser?._id || isPremium) return;
    
    // Solo rastrear tipos que requieren verificación en DB
    const trackableTypes: LimitType[] = ["transactions", "debts", "recurring_transactions", "categories"];
    if (!trackableTypes.includes(limitType)) return;
    
    try {
      await decrementUsage({
        userId: currentUser._id,
        limitType: limitType as "transactions" | "debts" | "recurring_transactions" | "categories",
        decrement
      });
    } catch (error) {
      console.error("Error reducing usage:", error);
    }
  };

  // Verificar límites específicos
  const checkTransactionLimit = () => canPerformAction("transactions");
  const checkDebtLimit = () => canPerformAction("debts");
  const checkRecurringTransactionLimit = () => canPerformAction("recurring_transactions");
  const checkCategoryLimit = () => canPerformAction("categories");
  
  // Verificar acceso a funciones premium
  const checkContactsAccess = () => {
    if (isFree) {
      setCurrentLimitType("contacts");
      setShowSubscriptionPopup(true);
      return false;
    }
    return true;
  };
  
  const checkAdvancedReportsAccess = () => {
    if (isFree) {
      setCurrentLimitType("reports");
      setShowSubscriptionPopup(true);
      return false;
    }
    return true;
  };
  
  const checkCurrencyAccess = () => {
    if (isFree) {
      setCurrentLimitType("currency");
      setShowSubscriptionPopup(true);
      return false;
    }
    return true;
  };
  
  const checkNumberFormatAccess = () => {
    if (isFree) {
      setCurrentLimitType("number_format");
      setShowSubscriptionPopup(true);
      return false;
    }
    return true;
  };

  // Obtener porcentaje de uso para un límite específico
  const getUsagePercentage = (limitType: LimitType): number => {
    if (!billingInfo || isPremium) return 0;
    
    const usage = billingInfo.usage;
    const limits = billingInfo.limits;
    
    switch (limitType) {
      case "transactions":
        return (usage.monthlyTransactions / limits.monthlyTransactions) * 100;
      case "debts":
        return (usage.activeDebts / limits.activeDebts) * 100;
      case "recurring_transactions":
        return (usage.recurringTransactions / limits.recurringTransactions) * 100;
      case "categories":
        return (usage.categories / limits.categories) * 100;
      default:
        return 0;
    }
  };

  // Verificar si está cerca del límite (80% o más)
  const isNearLimit = (limitType: LimitType): boolean => {
    return getUsagePercentage(limitType) >= 80;
  };

  // Verificar si alcanzó el límite
  const hasReachedLimit = (limitType: LimitType): boolean => {
    return getUsagePercentage(limitType) >= 100;
  };

  return {
    // Estado
    billingInfo,
    isPremium,
    isFree,
    showSubscriptionPopup,
    currentLimitType,
    
    // Acciones
    setShowSubscriptionPopup,
    canPerformAction,
    trackUsage,
    reduceUsage,
    
    // Verificaciones específicas
    checkTransactionLimit,
    checkDebtLimit,
    checkRecurringTransactionLimit,
    checkCategoryLimit,
    checkContactsAccess,
    checkAdvancedReportsAccess,
    checkCurrencyAccess,
    checkNumberFormatAccess,
    
    // Utilidades
    getUsagePercentage,
    isNearLimit,
    hasReachedLimit,
    
    // Datos de límites y uso
    limits: billingInfo?.limits,
    usage: billingInfo?.usage
  };
}