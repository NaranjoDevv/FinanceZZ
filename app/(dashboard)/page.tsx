"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { user } = useUser();

  const stats = [
    {
      title: "Balance Total",
      value: "$2,450.00",
      icon: BanknotesIcon,
      color: "bg-green-500",
      change: "+12.5%"
    },
    {
      title: "Gastos del Mes",
      value: "$1,230.00",
      icon: CreditCardIcon,
      color: "bg-red-500",
      change: "-8.2%"
    },
    {
      title: "Ingresos del Mes",
      value: "$3,680.00",
      icon: ChartBarIcon,
      color: "bg-blue-500",
      change: "+15.3%"
    },
    {
      title: "Deudas Pendientes",
      value: "$850.00",
      icon: UserGroupIcon,
      color: "bg-yellow-500",
      change: "-5.1%"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div className="px-4 sm:px-6 py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
        data-testid="dashboard-header"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 font-medium">
          Bienvenido de vuelta, {user?.firstName || 'Usuario'}
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button className="brutal-button brutal-button--primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Transacción
          </Button>
          <Button className="brutal-button">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Gestionar Deudas
          </Button>
          <Button className="brutal-button">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Ver Reportes
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
      >
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card className="brutal-card p-4 sm:p-6 hover:shadow-brutal-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-none ${stat.color}`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <p className="text-xl sm:text-2xl font-black">
                  {stat.value}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="brutal-card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 sm:p-4 border-2 border-black">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 border-2 border-black flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base truncate">Compra en Supermercado</p>
                    <p className="text-xs sm:text-sm text-gray-600">Hace 2 horas</p>
                  </div>
                </div>
                <span className="font-black text-red-600 text-sm sm:text-base flex-shrink-0 ml-2">-$45.50</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}