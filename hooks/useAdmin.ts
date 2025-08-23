"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

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
  // Queries
  const currentAdminUser = useQuery(api.admin.getCurrentAdminUser);
  const allUsers = useQuery(api.admin.getAllUsers, { limit: 50 });
  const allPlans = useQuery(api.admin.getAllPlans);
  const allCurrencies = useQuery(api.admin.getAllCurrencies);

  // Mutations
  const promoteUserToAdminMutation = useMutation(api.admin.promoteUserToAdmin);
  const updateUserLimitsMutation = useMutation(api.admin.updateUserLimits);
  const createSubscriptionPlanMutation = useMutation(api.admin.createSubscriptionPlan);
  const createCurrencyMutation = useMutation(api.admin.createCurrency);
  const assignPermissionToUserMutation = useMutation(api.admin.assignPermissionToUser);
  const initializeAdminSystemMutation = useMutation(api.admin.initializeAdminSystem);

  // Helper functions
  const isAdmin = () => {
    return currentAdminUser && (
      currentAdminUser.role === "admin" || 
      currentAdminUser.role === "super_admin"
    );
  };

  const isSuperAdmin = () => {
    return currentAdminUser && currentAdminUser.role === "super_admin";
  };

  const hasPermission = (permission: string) => {
    if (!currentAdminUser) return false;
    if (currentAdminUser.role === "super_admin") return true;
    return currentAdminUser.adminPermissions?.includes(permission) || false;
  };

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

  // Permission Helpers
  const canManageUsers = () => hasPermission(ADMIN_PERMISSIONS.MANAGE_USERS);
  const canViewUsers = () => hasPermission(ADMIN_PERMISSIONS.VIEW_USERS);
  const canEditUserRoles = () => hasPermission(ADMIN_PERMISSIONS.EDIT_USER_ROLES);
  const canManagePlans = () => hasPermission(ADMIN_PERMISSIONS.MANAGE_PLANS);
  const canViewPlans = () => hasPermission(ADMIN_PERMISSIONS.VIEW_PLANS);
  const canCreatePlans = () => hasPermission(ADMIN_PERMISSIONS.CREATE_PLANS);
  const canManageCurrencies = () => hasPermission(ADMIN_PERMISSIONS.MANAGE_CURRENCIES);
  const canViewCurrencies = () => hasPermission(ADMIN_PERMISSIONS.VIEW_CURRENCIES);
  const canCreateCurrencies = () => hasPermission(ADMIN_PERMISSIONS.CREATE_CURRENCIES);
  const canAssignPermissions = () => hasPermission(ADMIN_PERMISSIONS.ASSIGN_PERMISSIONS);
  const canViewAnalytics = () => hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS);
  const canViewAuditLogs = () => hasPermission(ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS);

  return {
    // State
    currentAdminUser,
    allUsers,
    allPlans,
    allCurrencies,
    isLoading: currentAdminUser === undefined,

    // Permission Checks
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    hasPermission,
    
    // Permission Helpers
    canManageUsers: canManageUsers(),
    canViewUsers: canViewUsers(),
    canEditUserRoles: canEditUserRoles(),
    canManagePlans: canManagePlans(),
    canViewPlans: canViewPlans(),
    canCreatePlans: canCreatePlans(),
    canManageCurrencies: canManageCurrencies(),
    canViewCurrencies: canViewCurrencies(),
    canCreateCurrencies: canCreateCurrencies(),
    canAssignPermissions: canAssignPermissions(),
    canViewAnalytics: canViewAnalytics(),
    canViewAuditLogs: canViewAuditLogs(),

    // Actions
    promoteUserToAdmin,
    updateUserLimits,
    createSubscriptionPlan,
    createCurrency,
    assignPermissionToUser,
    initializeAdminSystem,

    // Constants
    ADMIN_PERMISSIONS,
  };
}