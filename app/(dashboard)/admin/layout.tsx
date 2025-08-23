"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  UsersIcon, 
  CreditCardIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
  },
  {
    id: "users",
    title: "Usuarios",
    href: "/admin/users",
    icon: UsersIcon,
    permission: "view_users",
  },
  {
    id: "plans",
    title: "Planes",
    href: "/admin/plans",
    icon: CreditCardIcon,
    permission: "view_plans",
  },
  {
    id: "currencies",
    title: "Monedas",
    href: "/admin/currencies",
    icon: CurrencyDollarIcon,
    permission: "view_currencies",
  },
  {
    id: "permissions",
    title: "Permisos",
    href: "/admin/permissions",
    icon: ShieldCheckIcon,
    permission: "view_permissions",
  },
  {
    id: "analytics",
    title: "Analíticas",
    href: "/admin/analytics",
    icon: ChartBarIcon,
    permission: "view_analytics",
  },
  {
    id: "audit",
    title: "Auditoría",
    href: "/admin/audit",
    icon: DocumentTextIcon,
    permission: "view_audit_logs",
  },
  {
    id: "system",
    title: "Sistema",
    href: "/admin/system",
    icon: CogIcon,
    permission: "manage_system_settings",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentAdminUser, isAdmin, hasPermission, isLoading } = useAdmin();

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando...</h2>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  // Filter navigation items based on permissions
  const accessibleNavItems = NAV_ITEMS.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation Header */}
      <div className="bg-black text-white border-b-4 border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-black uppercase tracking-wider">
                Admin Panel
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>{currentAdminUser?.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-400 font-medium">
                  {currentAdminUser?.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-white font-bold"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al App
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white border-r-4 border-black min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {accessibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left font-medium border-2 border-black transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Admin Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}