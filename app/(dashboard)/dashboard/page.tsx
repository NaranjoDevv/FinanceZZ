"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/auth/SignInModal";
import NewTransactionModal from "@/components/forms/NewTransactionModal";
import {
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";
import { useTransactions } from "@/hooks/use-transactions";
import { useDebts } from "@/hooks/use-debts";
import { formatCurrency, formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { useCurrentUser } from "@/contexts/UserContext";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showNewTransaction, setShowNewTransaction] = useState(false);

  // Get real data from Convex - MUST be called before any conditional returns
  const { stats: transactionStats, transactions, isLoading: transactionsLoading } = useTransactions({ limit: 5 });
  const { stats: debtStats, isLoading: debtsLoading } = useDebts();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  
  const userCurrency = useMemo(() => toCurrency(currentUser?.currency || 'USD'), [currentUser?.currency]);
  const isDataLoading = transactionsLoading || debtsLoading || userLoading;
  
  // Calculate stats from real data (memoized)
  const useRounding = useMemo(() => currentUser?.numberRounding || false, [currentUser?.numberRounding]);

  // Memoized stats calculation
  const stats = useMemo(() => [
    {
      title: "Balance Total",
      value: isDataLoading ? formatCurrencyWithRounding(0, userCurrency, useRounding) : formatCurrencyWithRounding(transactionStats?.balance || 0, userCurrency, useRounding),
      fullValue: isDataLoading ? formatCurrency(0, userCurrency) : formatCurrency(transactionStats?.balance || 0, userCurrency),
      rawAmount: isDataLoading ? 0 : transactionStats?.balance || 0,
      icon: BanknotesIcon,
      color: "bg-green-500",
      change: "+12.5%"
    },
    {
      title: "Gastos del Mes",
      value: isDataLoading ? formatCurrencyWithRounding(0, userCurrency, useRounding) : formatCurrencyWithRounding(transactionStats?.totalExpenses || 0, userCurrency, useRounding),
      fullValue: isDataLoading ? formatCurrency(0, userCurrency) : formatCurrency(transactionStats?.totalExpenses || 0, userCurrency),
      rawAmount: isDataLoading ? 0 : transactionStats?.totalExpenses || 0,
      icon: CreditCardIcon,
      color: "bg-red-500",
      change: "-8.2%"
    },
    {
      title: "Ingresos del Mes",
      value: isDataLoading ? formatCurrencyWithRounding(0, userCurrency, useRounding) : formatCurrencyWithRounding(transactionStats?.totalIncome || 0, userCurrency, useRounding),
      fullValue: isDataLoading ? formatCurrency(0, userCurrency) : formatCurrency(transactionStats?.totalIncome || 0, userCurrency),
      rawAmount: isDataLoading ? 0 : transactionStats?.totalIncome || 0,
      icon: ChartBarIcon,
      color: "bg-blue-500",
      change: "+15.3%"
    },
    {
      title: "Me deben",
      value: isDataLoading ? formatCurrencyWithRounding(0, userCurrency, useRounding) : formatCurrencyWithRounding(debtStats?.totalOwedToMe || 0, userCurrency, useRounding),
      fullValue: isDataLoading ? formatCurrency(0, userCurrency) : formatCurrency(debtStats?.totalOwedToMe || 0, userCurrency),
      rawAmount: isDataLoading ? 0 : debtStats?.totalOwedToMe || 0,
      icon: ArrowTrendingUpIcon,
      color: "bg-green-500",
      change: "+"
    },
    {
      title: "Debo",
      value: isDataLoading ? formatCurrencyWithRounding(0, userCurrency, useRounding) : formatCurrencyWithRounding(debtStats?.totalIOwe || 0, userCurrency, useRounding),
      fullValue: isDataLoading ? formatCurrency(0, userCurrency) : formatCurrency(debtStats?.totalIOwe || 0, userCurrency),
      rawAmount: isDataLoading ? 0 : debtStats?.totalIOwe || 0,
      icon: ArrowTrendingDownIcon,
      color: "bg-red-500",
      change: "-"
    }
  ], [isDataLoading, transactionStats, debtStats, userCurrency, useRounding]);

  // Event handlers for buttons (memoized)
  const handleNewTransaction = useCallback(() => {
    setShowNewTransaction(true);
  }, []);

  const handleCloseNewTransaction = useCallback(() => {
    setShowNewTransaction(false);
  }, []);

  const handleTransactionCreated = useCallback(() => {
    setShowNewTransaction(false);
  }, []);

  const handleManageDebts = useCallback(() => {
    router.push('/debts');
  }, [router]);

  const handleViewReports = useCallback(() => {
    router.push('/reports');
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setShowSignIn(false);
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (isLoaded && !user) {
      setShowSignIn(true);
    }
  }, [isLoaded, user]);

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

        <NewTransactionModal
          isOpen={showNewTransaction}
          onClose={handleCloseNewTransaction}
          onTransactionCreated={handleTransactionCreated}
        />
      </>
    );
  }

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
          <Button onClick={handleNewTransaction} className="brutal-button brutal-button--primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Nueva Transacción
          </Button>
          <Button onClick={handleManageDebts} className="brutal-button flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Gestionar Deudas
          </Button>
          <Button onClick={handleViewReports} className="brutal-button flex items-center gap-2">
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
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              userCurrency={userCurrency}
              useRounding={useRounding}
              index={index}
            />
          ))}
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
              transactions.map((transaction: {
                _id: string;
                description: string;
                amount: number;
                type: 'income' | 'expense' | 'debt_payment' | 'loan_received';
                date: number;
                category?: {
                  name: string;
                  _id: string;
                } | null;
                subcategory?: {
                  name: string;
                  _id: string;
                } | null;
                notes?: string;
                tags?: string;
              }) => (
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
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), userCurrency).replace(/^[^\d-+]*/, '')}
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

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={showNewTransaction}
        onClose={handleCloseNewTransaction}
        onTransactionCreated={handleTransactionCreated}
      />
    </div>
  );
}