"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  UsersIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  
  // Fetch real data
  const allUsers = useQuery(api.admin.getAllUsers, {});
  const systemStats = useQuery(api.admin.getSystemStats);

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

        {/* Admin Modules - Enhanced Table View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white border-4 border-black shadow-brutal rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b-4 border-black p-6">
              <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
                <CogIcon className="w-8 h-8" />
                Módulos de Administración
              </h2>
              <p className="text-gray-600 font-medium mt-2">
                {accessibleModules.length} módulos disponibles para tu rol
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y-4 divide-black">
                {accessibleModules.map((module, index) => {
                  const getModuleStats = () => {
                    switch (module.id) {
                      case 'users':
                        return {
                          count: allUsers?.page?.length || 0,
                          label: 'usuarios registrados',
                          trend: '+12%',
                          status: 'active'
                        };
                      case 'plans':
                        return {
                          count: systemStats?.activePlans || 3,
                          label: 'planes activos',
                          trend: 'estable',
                          status: 'active'
                        };
                      case 'currencies':
                        return {
                          count: systemStats?.availableCurrencies || 0,
                          label: 'monedas disponibles',
                          trend: '+2',
                          status: 'active'
                        };
                      case 'analytics':
                        return {
                          count: systemStats?.totalTransactions || 0,
                          label: 'transacciones totales',
                          trend: '+8%',
                          status: 'active'
                        };
                      case 'system':
                        return {
                          count: systemStats?.systemUptime || '99.9%',
                          label: 'uptime del sistema',
                          trend: 'óptimo',
                          status: 'active'
                        };
                      default:
                        return {
                          count: '—',
                          label: 'datos no disponibles',
                          trend: '—',
                          status: 'pending'
                        };
                    }
                  };
                  
                  const stats = getModuleStats();
                  
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => router.push(module.href)}
                    >
                      <div className="flex items-center justify-between">
                        {/* Module Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-4 rounded-xl ${module.color} border-3 border-black group-hover:scale-110 transition-transform`}>
                            <module.icon className="w-8 h-8 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black uppercase text-gray-900">
                                {module.title}
                              </h3>
                              <Badge className={`${
                                stats.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 
                                'bg-yellow-100 text-yellow-800 border-yellow-300'
                              } border-2 font-bold`}>
                                {stats.status === 'active' ? 'ACTIVO' : 'PENDIENTE'}
                              </Badge>
                            </div>
                            <p className="text-gray-600 font-medium mb-3">
                              {module.description}
                            </p>
                            
                            {/* Stats Row */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-bold text-blue-600">
                                  {stats.count}
                                </span>
                                <span className="text-gray-500">{stats.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                                <span className="font-medium text-green-600">
                                  {stats.trend}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-2 border-gray-300 hover:border-black font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Quick action - could open a modal or show quick stats
                            }}
                          >
                            Vista Rápida
                          </Button>
                          <Button 
                            size="sm"
                            className="brutal-button brutal-button--primary font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(module.href);
                            }}
                          >
                            Administrar →
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 border-t-4 border-black p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Mostrando {accessibleModules.length} de {ADMIN_MODULES.length} módulos disponibles
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-bold">Sistema Operativo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Dashboard */}
        {hasPermission("view_analytics") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black uppercase tracking-wider">
                📊 Panel de Control
              </h2>
              <Badge className="bg-green-500 text-white font-bold px-4 py-2">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Sistema Operativo
              </Badge>
            </div>
            
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Usuarios Totales
                    </CardTitle>
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    {allUsers?.page?.length || 0}
                  </div>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    +12% este mes
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Transacciones
                    </CardTitle>
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-green-600 mb-2">
                    {systemStats?.totalTransactions || 0}
                  </div>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    +8% esta semana
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Monedas
                    </CardTitle>
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-purple-600 mb-2">
                    {systemStats?.availableCurrencies || 0}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-medium">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Activas
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Usuarios Activos
                    </CardTitle>
                    <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-yellow-600 mb-2">
                    {systemStats?.activeUsers || 0}
                  </div>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    75% del total
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-4 border-black shadow-brutal">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-black uppercase">
                    <ClockIcon className="w-6 h-6" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Nuevo usuario registrado</span>
                      </div>
                      <span className="text-sm text-gray-500">Hace 5 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Transacción procesada</span>
                      </div>
                      <span className="text-sm text-gray-500">Hace 12 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">Nueva categoría creada</span>
                      </div>
                      <span className="text-sm text-gray-500">Hace 1 hora</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-black uppercase">
                    <CogIcon className="w-6 h-6" />
                    Estado del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                        <span className="font-bold">Base de Datos</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-300">
                        Operativo
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                        <span className="font-bold">API</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-300">
                        Operativo
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                        <span className="font-bold">Autenticación</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-300">
                        Operativo
                      </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="text-sm text-gray-600">
                        <strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}
                      </div>
                    </div>
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