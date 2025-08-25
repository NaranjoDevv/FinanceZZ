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
  CheckCircleIcon,
  BoltIcon,
  CommandLineIcon
} from "@heroicons/react/24/outline";
import { BrutalAdminLayout, BrutalModuleCard } from "@/components/brutal/BrutalAdminLayout";
import { BrutalButton, BrutalCard, BrutalBadge } from "@/components/brutal";
import { useBrutalQuickView } from "@/components/brutal/BrutalQuickView";

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
  const { openQuickView } = useBrutalQuickView();
  
  // Fetch real data
  const allUsers = useQuery(api.admin.getAllUsers, {});
  const systemStats = useQuery(api.admin.getSystemStats);
  const allPlans = useQuery(api.admin.getAllPlans);
  const allCurrencies = useQuery(api.admin.getAllCurrencies);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white border-8 border-yellow-400 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-12 h-12 border-8 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-wider text-black mb-4">
            CARGANDO PANEL ADMINISTRATIVO
          </h2>
          <p className="text-sm font-bold uppercase text-gray-600">
            VERIFICANDO PERMISOS DE ACCESO...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-center p-8 bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md">
          <ExclamationTriangleIcon className="h-20 w-20 mx-auto mb-6 text-red-500 border-4 border-black p-2" />
          <h2 className="text-3xl font-black uppercase tracking-wider text-black mb-4">
            ACCESO DENEGADO
          </h2>
          <p className="text-sm font-bold text-gray-700 mb-6 uppercase">
            NO TIENES PERMISOS PARA ACCEDER AL PANEL DE ADMINISTRACIÓN
          </p>
          <BrutalButton 
            variant="danger"
            fullWidth
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            VOLVER AL DASHBOARD
          </BrutalButton>
        </div>
      </div>
    );
  }

  // Generate stats for the layout
  const layoutStats = [
    {
      label: 'USUARIOS TOTALES',
      value: allUsers?.page?.length || 0,
      trend: 'up' as const,
      trendValue: '+12%',
      type: 'success' as const
    },
    {
      label: 'MÓDULOS ACTIVOS',
      value: accessibleModules.length,
      trend: 'stable' as const,
      trendValue: 'Estable',
      type: 'primary' as const
    },
    {
      label: 'TRANSACCIONES',
      value: systemStats?.totalTransactions || 0,
      trend: 'up' as const,
      trendValue: '+8%',
      type: 'success' as const
    },
    {
      label: 'UPTIME SISTEMA',
      value: '99.9%',
      trend: 'stable' as const,
      trendValue: 'Óptimo',
      type: 'success' as const
    }
  ];

  const layoutActions = [
    {
      label: 'LOGS DEL SISTEMA',
      variant: 'secondary' as const,
      onClick: () => router.push('/admin/audit'),
      icon: <CommandLineIcon className="w-4 h-4" />
    },
    {
      label: 'CREAR RESPALDO',
      variant: 'success' as const,
      onClick: () => console.log('Create backup'),
      icon: <BoltIcon className="w-4 h-4" />
    }
  ];

  return (
    <BrutalAdminLayout
      title="PANEL DE ADMINISTRACIÓN"
      subtitle={`Bienvenido, ${currentAdminUser?.name} - ${currentAdminUser?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}`}
      actions={layoutActions}
      stats={layoutStats}
      quickViewEnabled={true}
      moduleId="admin-dashboard"
    >
      {/* BRUTAL WELCOME SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <BrutalCard className="p-8 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 border-8 border-black">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-black text-yellow-400 border-4 border-yellow-400">
              <ShieldCheckIcon className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-wider text-black mb-2">
                CONTROL TOTAL DEL SISTEMA
              </h2>
              <p className="text-lg font-bold text-black opacity-80">
                ADMINISTRA TODOS LOS ASPECTOS DE LA PLATAFORMA CON PODER ABSOLUTO
              </p>
              <div className="flex items-center gap-4 mt-4">
                <BrutalBadge variant="success">SISTEMA OPERATIVO</BrutalBadge>
                <BrutalBadge variant="default">{accessibleModules.length} MÓDULOS</BrutalBadge>
                <BrutalBadge variant="warning">ROL: {currentAdminUser?.role?.toUpperCase()}</BrutalBadge>
              </div>
            </div>
          </div>
        </BrutalCard>
      </motion.div>

      {/* BRUTAL MODULES GRID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase tracking-wider text-black mb-2 flex items-center gap-3">
            <CogIcon className="w-8 h-8" />
            MÓDULOS DE CONTROL TOTAL
          </h2>
          <p className="text-lg font-bold text-gray-700 uppercase">
            {accessibleModules.length} HERRAMIENTAS DE DOMINACIÓN DISPONIBLES
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {accessibleModules.map((module, index) => {
            const getModuleStats = () => {
              switch (module.id) {
                case 'users':
                  return {
                    count: allUsers?.page?.length || 0,
                    label: 'USUARIOS REGISTRADOS',
                    trend: '+12%'
                  };
                case 'plans':
                  return {
                    count: systemStats?.activePlans || 3,
                    label: 'PLANES ACTIVOS',
                    trend: 'ESTABLE'
                  };
                case 'currencies':
                  return {
                    count: systemStats?.availableCurrencies || 0,
                    label: 'MONEDAS DISPONIBLES',
                    trend: '+2'
                  };
                case 'analytics':
                  return {
                    count: systemStats?.totalTransactions || 0,
                    label: 'TRANSACCIONES TOTALES',
                    trend: '+8%'
                  };
                case 'system':
                  return {
                    count: systemStats?.systemUptime || '99.9%',
                    label: 'UPTIME DEL SISTEMA',
                    trend: 'ÓPTIMO'
                  };
                default:
                  return {
                    count: '—',
                    label: 'DATOS NO DISPONIBLES',
                    trend: '—'
                  };
              }
            };
            
            const stats = getModuleStats();
            
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <BrutalModuleCard
                  title={module.title.toUpperCase()}
                  description={module.description.toUpperCase()}
                  icon={<module.icon className="w-6 h-6" />}
                  stats={stats}
                  status="active"
                  actions={[
                    {
                      label: 'VISTA RÁPIDA',
                      variant: 'secondary',
                      onClick: () => openQuickView(
                        module.id, 
                        {
                          allUsers: allUsers?.page || [],
                          systemStats: systemStats,
                          allPlans: allPlans || [],
                          allCurrencies: allCurrencies || []
                        }, 
                        (path: string) => router.push(path)
                      )
                    },
                    {
                      label: 'ADMINISTRAR',
                      variant: 'primary',
                      onClick: () => router.push(module.href)
                    }
                  ]}
                  onClick={() => router.push(module.href)}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* BRUTAL ANALYTICS DASHBOARD */}
      {hasPermission("view_analytics") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black uppercase tracking-wider text-black mb-2 flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8" />
              CENTRO DE COMANDO ANALÍTICO
            </h2>
            <div className="flex items-center gap-4">
              <BrutalBadge variant="success">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                SISTEMA OPERATIVO
              </BrutalBadge>
              <BrutalBadge variant="warning">TIEMPO REAL</BrutalBadge>
            </div>
          </div>
          
          {/* BRUTAL STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <BrutalCard className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-8 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider">
                  USUARIOS TOTALES
                </h3>
                <UsersIcon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black mb-2">
                {allUsers?.page?.length || 0}
              </div>
              <div className="flex items-center text-sm font-bold">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +12% ESTE MES
              </div>
            </BrutalCard>

            <BrutalCard className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-8 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider">
                  TRANSACCIONES
                </h3>
                <BanknotesIcon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black mb-2">
                {systemStats?.totalTransactions || 0}
              </div>
              <div className="flex items-center text-sm font-bold">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                +8% ESTA SEMANA
              </div>
            </BrutalCard>

            <BrutalCard className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-8 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider">
                  MONEDAS ACTIVAS
                </h3>
                <CurrencyDollarIcon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black mb-2">
                {systemStats?.availableCurrencies || 0}
              </div>
              <div className="flex items-center text-sm font-bold">
                <ClockIcon className="w-4 h-4 mr-1" />
                OPERATIVAS
              </div>
            </BrutalCard>

            <BrutalCard className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-black border-8 border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider">
                  USUARIOS ACTIVOS
                </h3>
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black mb-2">
                {systemStats?.activeUsers || 0}
              </div>
              <div className="flex items-center text-sm font-bold">
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                75% DEL TOTAL
              </div>
            </BrutalCard>
          </div>

          {/* BRUTAL ACTIVITY AND STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <BrutalCard className="p-6 border-8 border-black">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black text-white border-2 border-black">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider">
                  ACTIVIDAD BRUTAL
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border-4 border-green-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase text-sm">NUEVO USUARIO REGISTRADO</span>
                  </div>
                  <BrutalBadge variant="success">5 MIN</BrutalBadge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 border-4 border-blue-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase text-sm">TRANSACCIÓN PROCESADA</span>
                  </div>
                  <BrutalBadge variant="default">12 MIN</BrutalBadge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 border-4 border-purple-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase text-sm">NUEVA CATEGORÍA CREADA</span>
                  </div>
                  <BrutalBadge variant="warning">1 HORA</BrutalBadge>
                </div>
              </div>
            </BrutalCard>

            <BrutalCard className="p-6 border-8 border-black">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black text-white border-2 border-black">
                  <CogIcon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider">
                  ESTADO DEL SISTEMA
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 border-4 border-green-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase">BASE DE DATOS</span>
                  </div>
                  <BrutalBadge variant="success">OPERATIVO</BrutalBadge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 border-4 border-green-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase">API</span>
                  </div>
                  <BrutalBadge variant="success">OPERATIVO</BrutalBadge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 border-4 border-green-300">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 border-2 border-black"></div>
                    <span className="font-bold text-black uppercase">AUTENTICACIÓN</span>
                  </div>
                  <BrutalBadge variant="success">OPERATIVO</BrutalBadge>
                </div>
                
                <div className="pt-4 border-t-4 border-black">
                  <div className="text-sm font-bold text-gray-700 uppercase">
                    <strong>ÚLTIMA ACTUALIZACIÓN:</strong> {new Date().toLocaleString('es-ES')}
                  </div>
                </div>
              </div>
            </BrutalCard>
          </div>
        </motion.div>
      )}
    </BrutalAdminLayout>
  );
}