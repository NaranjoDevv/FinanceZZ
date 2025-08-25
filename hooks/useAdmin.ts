"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useMemo, useCallback } from "react";

export interface AdminUser {
  _id: Id<"users">;
  name: string;
  email: string;
  role?: "user" | "admin" | "super_admin";
  plan: "free" | "premium" | "admin";
  adminPermissions?: string[];
  isActive?: boolean;
  createdAt?: number;
  lastLoginAt?: number;
}

export interface SubscriptionPlan {
  _id: Id<"subscriptionPlans">;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number;
  currency: string;
  isActive: boolean;
  limits: {
    monthlyTransactions: number;
    activeDebts: number;
    recurringTransactions: number;
    categories: number;
  };
  features: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"users">;
}

export interface Currency {
  _id: Id<"currencies">;
  code: string;
  name: string;
  symbol: string;
  position: "before" | "after";
  decimals: number;
  isActive: boolean;
  isDefault: boolean;
  exchangeRate?: number;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"users">;
}

export interface UserPermission {
  _id: Id<"userPermissions">;
  userId: Id<"users">;
  permission: string;
  grantedBy: Id<"users">;
  grantedAt: number;
  expiresAt?: number;
  isActive: boolean;
  notes?: string;
}

export const ADMIN_PERMISSIONS = {
  // User Management
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  EDIT_USER_ROLES: "edit_user_roles",
  DEACTIVATE_USERS: "deactivate_users",
  
  // Plan Management
  MANAGE_PLANS: "manage_plans",
  VIEW_PLANS: "view_plans",
  EDIT_PLAN_LIMITS: "edit_plan_limits",
  CREATE_PLANS: "create_plans",
  DELETE_PLANS: "delete_plans",
  
  // Currency Management
  MANAGE_CURRENCIES: "manage_currencies",
  VIEW_CURRENCIES: "view_currencies",
  CREATE_CURRENCIES: "create_currencies",
  EDIT_CURRENCIES: "edit_currencies",
  DELETE_CURRENCIES: "delete_currencies",
  
  // Permission Management
  MANAGE_PERMISSIONS: "manage_permissions",
  ASSIGN_PERMISSIONS: "assign_permissions",
  VIEW_PERMISSIONS: "view_permissions",
  
  // System Settings
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  
  // Analytics & Reports
  VIEW_ANALYTICS: "view_analytics",
  EXPORT_DATA: "export_data",
} as const;

export function useAdmin() {
  // Safe admin status check that doesn't throw errors
  const adminStatus = useQuery(api.admin.checkAdminStatus);
  
  // Use memoized value to prevent infinite loops
  const isAdminUser = useMemo(() => adminStatus?.isAdmin || false, [adminStatus?.isAdmin]);
  
  // Queries - conditionally called based on stable admin status
  const currentAdminUser = useQuery(
    api.admin.getCurrentAdminUser,
    isAdminUser ? {} : "skip"
  );
  const allUsers = useQuery(
    api.admin.getAllUsers, 
    isAdminUser ? { limit: 50 } : "skip"
  );
  const allPlans = useQuery(
    api.admin.getAllPlans,
    isAdminUser ? {} : "skip"
  );
  const allCurrencies = useQuery(
    api.admin.getAllCurrencies,
    isAdminUser ? {} : "skip"
  );

  // Mutations
  const promoteUserToAdminMutation = useMutation(api.admin.promoteUserToAdmin);
  const updateUserLimitsMutation = useMutation(api.admin.updateUserLimits);
  const createSubscriptionPlanMutation = useMutation(api.admin.createSubscriptionPlan);
  const updateSubscriptionPlanMutation = useMutation(api.admin.updateSubscriptionPlan);
  const deleteSubscriptionPlanMutation = useMutation(api.admin.deleteSubscriptionPlan);
  const toggleSubscriptionPlanStatusMutation = useMutation(api.admin.toggleSubscriptionPlanStatus);
  const createCurrencyMutation = useMutation(api.admin.createCurrency);
  const assignPermissionToUserMutation = useMutation(api.admin.assignPermissionToUser);
  const initializeAdminSystemMutation = useMutation(api.admin.initializeAdminSystem);

  // Helper functions - memoized to prevent infinite loops
  const isAdmin = useCallback(() => {
    return adminStatus?.isAdmin || false;
  }, [adminStatus?.isAdmin]);

  const isSuperAdmin = useCallback(() => {
    return adminStatus?.role === "super_admin" || false;
  }, [adminStatus?.role]);

  const hasPermission = useCallback((permission: string) => {
    // If not admin at all, return false
    if (!isAdmin()) return false;
    
    // Super admin has all permissions
    if (isSuperAdmin()) return true;
    
    // Check permissions from admin user data
    if (currentAdminUser) {
      return currentAdminUser.adminPermissions?.includes(permission) || false;
    }
    
    return false;
  }, [isAdmin, isSuperAdmin, currentAdminUser?.adminPermissions]);

  // User Management Functions
  const promoteUserToAdmin = async (
    targetUserId: Id<"users">, 
    role: "admin" | "super_admin", 
    permissions?: string[]
  ) => {
    try {
      const result = await promoteUserToAdminMutation({
        targetUserId,
        role,
        ...(permissions && { permissions }),
      });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error promoting user";
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateUserLimits = async (
    userId: Id<"users">,
    limits: {
      monthlyTransactions: number;
      activeDebts: number;
      recurringTransactions: number;
      categories: number;
    }
  ) => {
    try {
      const result = await updateUserLimitsMutation({
        userId,
        limits,
      });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error updating user limits";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Plan Management Functions
  const createSubscriptionPlan = async (planData: {
    name: string;
    displayName: string;
    description: string;
    priceMonthly: number;
    priceYearly?: number;
    currency: string;
    limits: {
      monthlyTransactions: number;
      activeDebts: number;
      recurringTransactions: number;
      categories: number;
    };
    features: string[];
    order: number;
  }) => {
    try {
      const result = await createSubscriptionPlanMutation(planData);
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating plan";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update subscription plan
  const updateSubscriptionPlan = async (
    planId: Id<"subscriptionPlans">,
    updateData: Partial<{
      name: string;
      displayName: string;
      description: string;
      priceMonthly: number;
      priceYearly: number;
      currency: string;
      limits: {
        monthlyTransactions: number;
        activeDebts: number;
        recurringTransactions: number;
        categories: number;
      };
      features: string[];
      order: number;
      isActive: boolean;
    }>
  ) => {
    try {
      const result = await updateSubscriptionPlanMutation({
        planId,
        ...updateData,
      });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error updating plan";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete subscription plan
  const deleteSubscriptionPlan = async (planId: Id<"subscriptionPlans">) => {
    try {
      const result = await deleteSubscriptionPlanMutation({ planId });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error deleting plan";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Toggle subscription plan status
  const toggleSubscriptionPlanStatus = async (planId: Id<"subscriptionPlans">) => {
    try {
      const result = await toggleSubscriptionPlanStatusMutation({ planId });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error toggling plan status";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Currency Management Functions
  const createCurrency = async (currencyData: {
    code: string;
    name: string;
    symbol: string;
    position: "before" | "after";
    decimals: number;
    exchangeRate?: number;
  }) => {
    try {
      const result = await createCurrencyMutation(currencyData);
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating currency";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Permission Management Functions
  const assignPermissionToUser = async (
    userId: Id<"users">,
    permission: string,
    expiresAt?: number,
    notes?: string
  ) => {
    try {
      const result = await assignPermissionToUserMutation({
        userId,
        permission,
        ...(expiresAt && { expiresAt }),
        ...(notes && { notes }),
      });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error assigning permission";
      toast.error(errorMessage);
      throw error;
    }
  };

  // System Initialization
  const initializeAdminSystem = async (superAdminEmail: string) => {
    try {
      const result = await initializeAdminSystemMutation({
        superAdminEmail,
      });
      toast.success(result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error initializing admin system";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Permission Helpers - memoized to prevent re-computation
  const canManageUsers = useMemo(() => hasPermission(ADMIN_PERMISSIONS.MANAGE_USERS), [hasPermission]);
  const canViewUsers = useMemo(() => hasPermission(ADMIN_PERMISSIONS.VIEW_USERS), [hasPermission]);
  const canEditUserRoles = useMemo(() => hasPermission(ADMIN_PERMISSIONS.EDIT_USER_ROLES), [hasPermission]);
  const canManagePlans = useMemo(() => hasPermission(ADMIN_PERMISSIONS.MANAGE_PLANS), [hasPermission]);
  const canViewPlans = useMemo(() => hasPermission(ADMIN_PERMISSIONS.VIEW_PLANS), [hasPermission]);
  const canCreatePlans = useMemo(() => hasPermission(ADMIN_PERMISSIONS.CREATE_PLANS), [hasPermission]);
  const canManageCurrencies = useMemo(() => hasPermission(ADMIN_PERMISSIONS.MANAGE_CURRENCIES), [hasPermission]);
  const canViewCurrencies = useMemo(() => hasPermission(ADMIN_PERMISSIONS.VIEW_CURRENCIES), [hasPermission]);
  const canCreateCurrencies = useMemo(() => hasPermission(ADMIN_PERMISSIONS.CREATE_CURRENCIES), [hasPermission]);
  const canAssignPermissions = useMemo(() => hasPermission(ADMIN_PERMISSIONS.ASSIGN_PERMISSIONS), [hasPermission]);
  const canViewAnalytics = useMemo(() => hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS), [hasPermission]);
  const canViewAuditLogs = useMemo(() => hasPermission(ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS), [hasPermission]);

  return {
    // State
    currentAdminUser,
    adminStatus,
    allUsers,
    allPlans,
    allCurrencies,
    isLoading: adminStatus === undefined,

    // Permission Checks
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    hasPermission,
    
    // Permission Helpers
    canManageUsers,
    canViewUsers,
    canEditUserRoles,
    canManagePlans,
    canViewPlans,
    canCreatePlans,
    canManageCurrencies,
    canViewCurrencies,
    canCreateCurrencies,
    canAssignPermissions,
    canViewAnalytics,
    canViewAuditLogs,

    // Actions
    promoteUserToAdmin,
    updateUserLimits,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    toggleSubscriptionPlanStatus,
    createCurrency,
    assignPermissionToUser,
    initializeAdminSystem,

    // Constants
    ADMIN_PERMISSIONS,
  };
}