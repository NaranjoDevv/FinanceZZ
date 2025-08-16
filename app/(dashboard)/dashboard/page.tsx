"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/auth/SignInModal";
import {
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { useTransactions } from "@/hooks/use-transactions";
import { useDebts } from "@/hooks/use-debts";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);

  // Get real data from Convex - MUST be called before any conditional returns
  const { stats: transactionStats, transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { stats: debtStats, isLoading: debtsLoading } = useDebts();

  useEffect(() => {
    if (isLoaded && !user) {
      // Si no hay usuario autenticado, mostrar modal de login
      setShowSignIn(true);
    }
  }, [isLoaded, user]);

  const handleCloseModal = () => {
    setShowSignIn(false);
    // Redirigir a la página principal después de cerrar el modal
    router.push('/');
  };

  // Si está cargando, mostrar loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando...</h2>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar modal de login
  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-4">Necesitas iniciar sesión para acceder al dashboard.</p>
            <Button onClick={() => setShowSignIn(true)} className="brutal-button brutal-button--primary">
              Iniciar Sesión
            </Button>
          </div>
        </div>

        <SignInModal
          onSwitchToSignUp={() => {}}
          isOpen={showSignIn}
          onClose={handleCloseModal}
        />
      </>
    );
  }
  
  const isDataLoading = transactionsLoading || debtsLoading;
  
  // Calculate stats from real data
  const stats = [
    {
      title: "Balance Total",
      value: isDataLoading ? "$0.00" : `$${transactionStats?.balance?.toFixed(2) || '0.00'}`,
      icon: BanknotesIcon,
      color: "bg-green-500",
      change: "+12.5%" // TODO: Calculate real change percentage
    },
    {
      title: "Gastos del Mes",
      value: isDataLoading ? "$0.00" : `$${transactionStats?.totalExpenses?.toFixed(2) || '0.00'}`,
      icon: CreditCardIcon,
      color: "bg-red-500",
      change: "-8.2%" // TODO: Calculate real change percentage
    },
    {
      title: "Ingresos del Mes",
      value: isDataLoading ? "$0.00" : `$${transactionStats?.totalIncome?.toFixed(2) || '0.00'}`,
      icon: ChartBarIcon,
      color: "bg-blue-500",
      change: "+15.3%" // TODO: Calculate real change percentage
    },
    {
      title: "Deudas Pendientes",
      value: isDataLoading ? "$0.00" : `$${debtStats?.netBalance?.toFixed(2) || '0.00'}`,
      icon: UserGroupIcon,
      color: "bg-yellow-500",
      change: debtStats?.netBalance >= 0 ? "+" : "-"
    }
  ];

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <div className="pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-medium mb-6">
            Bienvenido de vuelta, {user.firstName || 'Usuario'}
          </p>
          <div className="w-full h-1 bg-black mb-8"></div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex gap-4 flex-wrap">
          <Button className="brutal-button brutal-button--primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Nueva Transacción
          </Button>
          <Button className="brutal-button flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Gestionar Deudas
          </Button>
          <Button className="brutal-button flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Ver Reportes
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="brutal-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-black">
                    {stat.value}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="brutal-card p-6">
          <h2 className="text-xl font-black uppercase tracking-wide mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {isDataLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando actividad reciente...
              </div>
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-black ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay transacciones recientes
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}