"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBilling } from "@/hooks/useBilling";
import { SubscriptionPopup } from "@/components/billing/SubscriptionPopup";

import {
  HomeIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  UserIcon,
  BellIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Transacciones", href: "/transactions", icon: CreditCardIcon },
  { name: "Recurrentes", href: "/recurring-transactions", icon: ArrowPathIcon },
  { name: "Categorías", href: "/categories", icon: TagIcon },
  { name: "Deudas", href: "/debts", icon: UserGroupIcon },
  { name: "Contactos", href: "/contacts", icon: UserIcon },
  { name: "Recordatorios", href: "/reminders", icon: BellIcon },
  { name: "Reportes", href: "/reports", icon: ChartBarIcon },
  { name: "Datos Ejemplo", href: "/seed", icon: CogIcon },
  { name: "Configuración", href: "/settings", icon: CogIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { 
    billingInfo, 
    isFree, 
    isPremium, 
    showSubscriptionPopup, 
    setShowSubscriptionPopup, 
    currentLimitType 
  } = useBilling();
  
  // Mostrar popup de suscripción al cargar el dashboard para usuarios gratuitos
  useEffect(() => {
    if (pathname === '/dashboard' && isFree && billingInfo) {
      const timer = setTimeout(() => {
        setShowSubscriptionPopup(true);
      }, 2000); // Mostrar después de 2 segundos
      
      return () => clearTimeout(timer);
    }
  }, [pathname, isFree, billingInfo, setShowSubscriptionPopup]);
  
  // Mostrar toda la navegación pero marcar elementos premium para usuarios gratuitos
  const navigationWithStatus = navigation.map(item => ({
    ...item,
    isPremium: currentUser?.plan === "free" && item.href === "/contacts",
    isDisabled: currentUser?.plan === "free" && item.href === "/contacts"
  }));

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:bg-white lg:border-r-4 lg:border-black">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b-4 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-black">
                Finance
              </h1>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-600">
                Tracker
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigationWithStatus.map((item) => {
                const IconComponent = item.icon;
                // Check if current path matches the item href or if it's a subcategory of categories
                const isActive = pathname === item.href || 
                  (item.href === '/categories' && pathname.startsWith('/categories/'));

                const handleClick = (e: React.MouseEvent) => {
                  if (item.isDisabled) {
                    e.preventDefault();
                    setShowSubscriptionPopup(true);
                  }
                };

                return (
                  <li key={item.name}>
                    <Link
                      href={item.isDisabled ? "#" : item.href}
                      onClick={handleClick}
                      className={`flex items-center px-4 py-3 text-sm font-bold uppercase tracking-wide border-2 border-black transition-all duration-200 ${item.isDisabled
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        : isActive
                        ? "bg-yellow-400 text-black shadow-brutal"
                        : "bg-white text-black hover:bg-gray-100 hover:shadow-brutal"
                        }`}
                    >
                      <IconComponent className={`w-5 h-5 mr-3 ${item.isDisabled ? "text-gray-400" : ""}`} />
                      <span className="truncate">{item.name}</span>
                      {item.isPremium && (
                        <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-black">
                          PRO
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-6 border-t-4 border-black">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-black"
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wide truncate text-black">
                    Mi Cuenta
                  </p>
                  {billingInfo && (
                    <Badge 
                      variant={isPremium ? "default" : "secondary"}
                      className={`text-xs font-bold uppercase mt-1 ${
                        isPremium 
                          ? "bg-yellow-400 text-yellow-900 border-yellow-600" 
                          : "bg-gray-200 text-gray-700 border-gray-400"
                      }`}
                    >
                      {isPremium ? "Premium" : "Gratuito"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white border-r-4 border-black lg:hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-4 border-black">
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
                Finance
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600">
                Tracker
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 sm:p-6">
            <ul className="space-y-1 sm:space-y-2">
              {navigationWithStatus.map((item) => {
                const IconComponent = item.icon;
                // Check if current path matches the item href or if it's a subcategory of categories
                const isActive = pathname === item.href || 
                  (item.href === '/categories' && pathname.startsWith('/categories/'));

                const handleClick = (e: React.MouseEvent) => {
                  if (item.isDisabled) {
                    e.preventDefault();
                    setShowSubscriptionPopup(true);
                  } else {
                    setSidebarOpen(false);
                  }
                };

                return (
                  <li key={item.name}>
                    <Link
                      href={item.isDisabled ? "#" : item.href}
                      className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wide border-2 border-black transition-all duration-200 ${item.isDisabled
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                        : isActive
                        ? "bg-yellow-400 text-black shadow-brutal"
                        : "bg-white text-black hover:bg-gray-100 hover:shadow-brutal"
                        }`}
                      onClick={handleClick}
                    >
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 ${item.isDisabled ? "text-gray-400" : ""}`} />
                      <span className="truncate">{item.name}</span>
                      {item.isPremium && (
                        <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-black">
                          PRO
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 sm:p-6 border-t-4 border-black">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 sm:w-10 sm:h-10 border-2 border-black"
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wide truncate text-black">
                    Mi Cuenta
                  </p>
                  {billingInfo && (
                    <Badge 
                      variant={isPremium ? "default" : "secondary"}
                      className={`text-xs font-bold uppercase mt-1 ${
                        isPremium 
                          ? "bg-yellow-400 text-yellow-900 border-yellow-600" 
                          : "bg-gray-200 text-gray-700 border-gray-400"
                      }`}
                    >
                      {isPremium ? "Premium" : "Gratuito"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Tema
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b-4 border-black flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <div className="flex items-center space-x-2 sm:space-x-4 mr-8">
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="sm:hidden">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  {new Date().toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>

            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Subscription Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        limitType={currentLimitType}
        currentUsage={billingInfo?.usage?.monthlyTransactions || 0}
        limit={billingInfo?.limits?.monthlyTransactions || 50}
      />
    </div>
  );
}