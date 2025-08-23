"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  UsersIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permission: string;
  color: string;
}

const ADMIN_MODULES: AdminModule[] = [
  {
    id: "users",
    title: "Gestión de Usuarios",
    description: "Administrar usuarios, roles y permisos del sistema",
    icon: UsersIcon,
    href: "/admin/users",
    permission: "view_users",
    color: "bg-blue-500",
  },
  {
    id: "plans",
    title: "Planes de Suscripción",
    description: "Crear y gestionar planes de suscripción y límites",
    icon: CreditCardIcon,
    href: "/admin/plans",
    permission: "view_plans",
    color: "bg-green-500",
  },
  {
    id: "currencies",
    title: "Gestión de Monedas",
    description: "Administrar monedas disponibles en el sistema",
    icon: CurrencyDollarIcon,
    href: "/admin/currencies",
    permission: "view_currencies",
    color: "bg-yellow-500",
  },
  {
    id: "permissions",
    title: "Permisos del Sistema",
    description: "Configurar permisos y roles de administración",
    icon: ShieldCheckIcon,
    href: "/admin/permissions",
    permission: "view_permissions",
    color: "bg-purple-500",
  },
  {
    id: "analytics",
    title: "Analíticas",
    description: "Ver estadísticas y métricas del sistema",
    icon: ChartBarIcon,
    href: "/admin/analytics",
    permission: "view_analytics",
    color: "bg-indigo-500",
  },
  {
    id: "audit",
    title: "Logs de Auditoría",
    description: "Revisar logs de acciones administrativas",
    icon: DocumentTextIcon,
    href: "/admin/audit",
    permission: "view_audit_logs",
    color: "bg-red-500",
  },
  {
    id: "system",
    title: "Configuración del Sistema",
    description: "Gestionar configuraciones globales",
    icon: CogIcon,
    href: "/admin/system",
    permission: "manage_system_settings",
    color: "bg-gray-500",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentAdminUser, isAdmin, hasPermission, isLoading } = useAdmin();
  const [accessibleModules, setAccessibleModules] = useState<AdminModule[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    // Filter modules based on user permissions
    const modules = ADMIN_MODULES.filter(module => 
      hasPermission(module.permission)
    );
    setAccessibleModules(modules);
  }, [isAdmin, hasPermission, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando Panel de Administración...</h2>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder al panel de administración.</p>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="brutal-button brutal-button--primary"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600 font-medium mb-4">
            Bienvenido, {currentAdminUser?.name}
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600 uppercase">
                {currentAdminUser?.role === "super_admin" ? "Super Administrador" : "Administrador"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-600">
                {accessibleModules.length} módulos disponibles
              </span>
            </div>
          </div>
          <div className="w-full h-1 bg-black"></div>
        </motion.div>

        {/* Admin Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {accessibleModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card 
                className="border-4 border-black shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer h-full"
                onClick={() => router.push(module.href)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg ${module.color} border-2 border-black`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-black uppercase">
                      {module.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 font-medium">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full brutal-button brutal-button--primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(module.href);
                    }}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Stats */}
        {hasPermission("view_analytics") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-black uppercase tracking-wider mb-6">
              Estadísticas Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-4 border-black shadow-brutal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase">
                    Usuarios Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">
                    {/* This would come from a stats query */}
                    0
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase">
                    Usuarios Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">
                    0
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase">
                    Planes Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">
                    0
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 uppercase">
                    Monedas Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">
                    0
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CogIcon className="w-5 h-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                  <span className="font-medium">Sistema Operativo</span>
                </div>
                <div className="text-sm text-gray-600">
                  Última actualización: {new Date().toLocaleString('es-ES')}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}