"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { useReports } from "@/hooks/use-reports";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FinancialSummaryCard } from "@/components/reports/FinancialSummaryCard";
import { IncomeExpenseChart } from "@/components/reports/IncomeExpenseChart";
import { CategoryDistributionChart } from "@/components/reports/CategoryDistributionChart";
import { MonthlyTrendChart } from "@/components/reports/MonthlyTrendChart";
import { toCurrency } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportsPage() {
  const { reportData, isLoading, currentUser, hasData, refetch } = useReports();
  const userCurrency = toCurrency(currentUser?.currency || 'USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Este mes');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Reportes actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los reportes');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    try {
      const dataToExport = {
        resumen: {
          ingresoTotal: reportData.totalIncome,
          gastoTotal: reportData.totalExpenses,
          balance: reportData.balance,
          moneda: currentUser?.currency || 'USD'
        },
        distribucionCategorias: reportData.categoryDistribution,
        distribucionSubcategorias: reportData.subcategoryDistribution,
        tendenciaMensual: reportData.monthlyTrend,
        fechaGeneracion: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Reporte exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar el reporte');
    }
  };

  const handlePeriodChange = () => {
    const periods = ['Este mes', 'Últimos 3 meses', 'Últimos 6 meses', 'Este año'];
    const currentIndex = periods.indexOf(selectedPeriod);
    const nextIndex = (currentIndex + 1) % periods.length;
    const nextPeriod = periods[nextIndex];
    if (nextPeriod) {
      setSelectedPeriod(nextPeriod);
      toast.info(`Período cambiado a: ${nextPeriod}`);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="mb-8 pt-6">
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black">
            Reportes
          </h1>
          <p className="text-gray-600 font-medium">
            Analiza tus finanzas con reportes detallados
          </p>
          <div className="w-20 h-1 bg-black mt-4"></div>
        </div>
        <Card className="brutal-card p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">
              Cargando reportes...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black">
          Reportes
        </h1>
        <p className="text-gray-600 font-medium">
          Analiza tus finanzas con reportes detallados
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-4">
          <Button
            className="brutal-button brutal-button--primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <ChartBarIcon className="w-5 h-5 mr-2" />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            className="brutal-button"
            onClick={handleExport}
            disabled={!hasData}
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Exportar
          </Button>
          <Button
            className="brutal-button"
            onClick={handlePeriodChange}
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            {selectedPeriod}
          </Button>
        </div>
      </motion.div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="brutal-card p-6">
            <h2 className="text-xl font-black uppercase tracking-wide mb-4 text-black">
              Reportes Financieros
            </h2>
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium mb-2">
                No tienes transacciones aún
              </p>
              <p className="text-gray-400 text-sm">
                Crea algunas transacciones para ver tus reportes financieros
              </p>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-8"
        >
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialSummaryCard
              title="Total Ingresos"
              amount={reportData.totalIncome}
              currency={currentUser?.currency || 'USD'}
              type="income"
              count={reportData.incomeCount}
            />
            <FinancialSummaryCard
              title="Total Gastos"
              amount={reportData.totalExpenses}
              currency={currentUser?.currency || 'USD'}
              type="expense"
              count={reportData.expenseCount}
            />
            <FinancialSummaryCard
              title="Balance"
              amount={reportData.balance}
              currency={currentUser?.currency || 'USD'}
              type="balance"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart
              totalIncome={reportData.totalIncome}
              totalExpenses={reportData.totalExpenses}
              currency={currentUser?.currency || 'USD'}
            />
            <CategoryDistributionChart
              data={reportData.categoryDistribution}
              currency={currentUser?.currency || 'USD'}
              title="Gastos por Categoría"
            />
          </div>

          {/* Monthly Trend */}
          <MonthlyTrendChart
            data={reportData.monthlyTrend}
            currency={currentUser?.currency || 'USD'}
          />

          {/* Subcategory Distribution */}
          {reportData.subcategoryDistribution.length > 0 && (
            <CategoryDistributionChart
              data={reportData.subcategoryDistribution}
              currency={currentUser?.currency || 'USD'}
              title="Gastos por Subcategoría"
            />
          )}
        </motion.div>
      )}
    </div>
  );
}