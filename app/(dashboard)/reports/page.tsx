"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { useEnhancedReports } from "@/hooks/use-enhanced-reports";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FinancialSummaryCard } from "@/components/reports/FinancialSummaryCard";
import { IncomeExpenseChart } from "@/components/reports/IncomeExpenseChart";
import { CategoryDistributionChart } from "@/components/reports/CategoryDistributionChart";
import { MonthlyTrendChart } from "@/components/reports/MonthlyTrendChart";
import { RecurringTransactionsReport } from "@/components/reports/RecurringTransactionsReport";
import { toCurrency } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";
import { 
  FunnelIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const { reportData, isLoading, currentUser, hasData, hasTransactions, hasRecurringTransactions, refetch } = useEnhancedReports();
  const userCurrency = toCurrency(currentUser?.currency || 'USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Este mes');
  
  // Customization states
  const [showCustomization, setShowCustomization] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [dateRange, setDateRange] = useState('month');
  const [showIncomeChart, setShowIncomeChart] = useState(true);
  const [showCategoryChart, setShowCategoryChart] = useState(true);
  const [showTrendChart, setShowTrendChart] = useState(true);
  const [showSubcategoryChart, setShowSubcategoryChart] = useState(true);
  const [showRecurringReport, setShowRecurringReport] = useState(true);

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
      // Validate data before export
      if (!reportData || (!hasData && !hasRecurringTransactions)) {
        toast.error('No hay datos suficientes para exportar');
        return;
      }

      // Sanitize numeric values to prevent NaN in export
      const sanitizeValue = (value: number) => {
        return isNaN(value) || !isFinite(value) ? 0 : value;
      };

      const dataToExport = {
        metadata: {
          fechaGeneracion: new Date().toISOString(),
          periodo: selectedPeriod,
          moneda: currentUser?.currency || 'USD',
          version: '2.0',
          tiposDeTransacciones: {
            tieneTransacciones: hasTransactions,
            tieneRecurrentes: hasRecurringTransactions
          }
        },
        resumen: {
          ingresoTotal: sanitizeValue(reportData.totalIncome),
          gastoTotal: sanitizeValue(reportData.totalExpenses),
          balance: sanitizeValue(reportData.balance),
          conteoIngresos: reportData.incomeCount || 0,
          conteoGastos: reportData.expenseCount || 0,
          ingresoRecurrente: sanitizeValue(reportData.recurringIncome || 0),
          gastoRecurrente: sanitizeValue(reportData.recurringExpenses || 0),
          balanceRecurrente: sanitizeValue((reportData.recurringIncome || 0) - (reportData.recurringExpenses || 0))
        },
        distribucionCategorias: reportData.categoryDistribution?.map(item => ({
          ...item,
          value: sanitizeValue(item.value)
        })) || [],
        distribucionSubcategorias: reportData.subcategoryDistribution?.map(item => ({
          ...item,
          value: sanitizeValue(item.value)
        })) || [],
        tendenciaMensual: reportData.monthlyTrend?.map(item => ({
          ...item,
          income: sanitizeValue(item.income),
          expenses: sanitizeValue(item.expenses),
          balance: sanitizeValue(item.balance)
        })) || [],
        transaccionesRecurrentes: {
          total: reportData.recurringTransactionsSummary?.total || 0,
          activas: reportData.recurringTransactionsSummary?.active || 0,
          pausadas: reportData.recurringTransactionsSummary?.paused || 0,
          impactoMensual: sanitizeValue(reportData.recurringTransactionsSummary?.monthlyImpact || 0)
        },
        configuracion: {
          tipoGrafico: chartType,
          rangoFecha: dateRange,
          seccionesVisibles: {
            ingresoGasto: showIncomeChart,
            categorias: showCategoryChart,
            tendencias: showTrendChart,
            subcategorias: showSubcategoryChart,
            recurrentes: showRecurringReport
          }
        }
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
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar el reporte. Inténtalo de nuevo.');
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
        className="mb-6 pt-6"
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
        className="mb-6"
      >
        <div className="flex flex-wrap gap-3">
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
          <Button
            className={`brutal-button transition-all duration-300 ${
              showCustomization 
                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105' 
                : 'bg-white text-black border-black hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105'
            }`}
            onClick={() => setShowCustomization(!showCustomization)}
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            PERSONALIZAR
            <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-300 ${
              showCustomization ? 'rotate-180' : 'rotate-0'
            }`} />
          </Button>
        </div>
      </motion.div>

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomization && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: "auto",
              transition: {
                opacity: { delay: 0.1, duration: 0.3 },
                height: { delay: 0.1, duration: 0.2 }
              }
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                opacity: { duration: 0.2 },
                height: { delay: 0.1, duration: 0.2 }
              }
            }}
            className="mb-6 overflow-hidden"
          >
            <Card className="brutal-card p-5 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 bg-black flex items-center justify-center">
                  <Cog6ToothIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  PERSONALIZACIÓN DE REPORTES
                </h3>
                <div className="flex-1 h-1 bg-black"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Range */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    PERÍODO DE TIEMPO
                  </label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full h-12 border-4 border-black font-black text-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                      <SelectValue placeholder="SELECCIONAR PERÍODO" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="week" className="font-black uppercase">ÚLTIMA SEMANA</SelectItem>
                      <SelectItem value="month" className="font-black uppercase">ÚLTIMO MES</SelectItem>
                      <SelectItem value="quarter" className="font-black uppercase">ÚLTIMO TRIMESTRE</SelectItem>
                      <SelectItem value="year" className="font-black uppercase">ÚLTIMO AÑO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chart Type */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    TIPO DE GRÁFICO
                  </label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-full h-12 border-4 border-black font-black text-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                      <SelectValue placeholder="SELECCIONAR TIPO" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="bar" className="font-black uppercase">BARRAS</SelectItem>
                      <SelectItem value="line" className="font-black uppercase">LÍNEAS</SelectItem>
                      <SelectItem value="pie" className="font-black uppercase">CIRCULAR</SelectItem>
                      <SelectItem value="area" className="font-black uppercase">ÁREA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility Controls */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    SECCIONES VISIBLES
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                      <span className="text-xs font-black uppercase">INGRESOS/GASTOS</span>
                      <Button
                        onClick={() => setShowIncomeChart(!showIncomeChart)}
                        className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                      >
                        {showIncomeChart ? 
                          <EyeIcon className="w-4 h-4 text-black" /> : 
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        }
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                      <span className="text-xs font-black uppercase">CATEGORÍAS</span>
                      <Button
                        onClick={() => setShowCategoryChart(!showCategoryChart)}
                        className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                      >
                        {showCategoryChart ? 
                          <EyeIcon className="w-4 h-4 text-black" /> : 
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        }
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">TENDENCIAS</span>
                       <Button
                         onClick={() => setShowTrendChart(!showTrendChart)}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {showTrendChart ? 
                           <EyeIcon className="w-4 h-4 text-black" /> : 
                           <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                         }
                       </Button>
                     </div>
                     <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">SUBCATEGORÍAS</span>
                       <Button
                         onClick={() => setShowSubcategoryChart(!showSubcategoryChart)}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {showSubcategoryChart ? 
                           <EyeIcon className="w-4 h-4 text-black" /> : 
                           <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                         }
                       </Button>
                     </div>
                     <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">RECURRENTES</span>
                       <Button
                         onClick={() => setShowRecurringReport(!showRecurringReport)}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {showRecurringReport ? 
                           <EyeIcon className="w-4 h-4 text-black" /> : 
                           <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                         }
                       </Button>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Customization Summary */}
              <div className="mt-5 pt-4 border-t-4 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wide">
                    <span className="text-gray-600">CONFIGURACIÓN:</span>
                    <span className="text-black">{chartType.toUpperCase()} • {dateRange.toUpperCase()}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setChartType('bar');
                      setDateRange('month');
                      setShowIncomeChart(true);
                      setShowCategoryChart(true);
                      setShowTrendChart(true);
                      setShowSubcategoryChart(true);
                      setShowRecurringReport(true);
                      toast.success('Configuración restablecida');
                    }}
                    className="bg-gray-100 text-black border-2 border-black font-black text-xs px-3 py-1 hover:bg-gray-200 transition-colors duration-200 uppercase tracking-wide"
                  >
                    RESTABLECER
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay datos para mostrar
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-gray-500 font-medium">
                  {!hasTransactions && !hasRecurringTransactions && "No tienes transacciones ni transacciones recurrentes"}
                  {!hasTransactions && hasRecurringTransactions && "Solo tienes transacciones recurrentes. Agrega transacciones normales para ver reportes completos"}
                  {hasTransactions && !hasRecurringTransactions && "Solo tienes transacciones normales. Considera agregar transacciones recurrentes"}
                </p>
                <p className="text-sm text-gray-400">
                  Estado: {hasTransactions ? '✓' : '✗'} Transacciones | {hasRecurringTransactions ? '✓' : '✗'} Recurrentes
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/transactions'}
                  className="brutal-button"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Agregar Transacción
                </Button>
                <Button 
                  onClick={() => window.location.href = '/recurring-transactions'}
                  className="brutal-button"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Transacciones Recurrentes
                </Button>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Recurring Transactions Report */}
          {showRecurringReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RecurringTransactionsReport
                currency={currentUser?.currency || 'USD'}
              />
            </motion.div>
          )}

          {/* Charts Grid */}
          {(showIncomeChart || showCategoryChart || showSubcategoryChart || showTrendChart) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {showIncomeChart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <IncomeExpenseChart
                    totalIncome={reportData.totalIncome}
                    totalExpenses={reportData.totalExpenses}
                    currency={currentUser?.currency || 'USD'}
                  />
                </motion.div>
              )}
              
              {showCategoryChart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <CategoryDistributionChart
                    data={reportData.categoryDistribution}
                    currency={currentUser?.currency || 'USD'}
                    title="Gastos por Categoría"
                  />
                </motion.div>
              )}

              {/* Monthly Trend */}
              {showTrendChart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <MonthlyTrendChart
                    data={reportData.monthlyTrend}
                    currency={currentUser?.currency || 'USD'}
                  />
                </motion.div>
              )}

              {/* Subcategory Distribution */}
              {showSubcategoryChart && reportData.subcategoryDistribution.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <CategoryDistributionChart
                    data={reportData.subcategoryDistribution}
                    currency={currentUser?.currency || 'USD'}
                    title="Gastos por Subcategoría"
                  />
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <Card className="brutal-card p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 border-4 border-black flex items-center justify-center">
                    <EyeSlashIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black uppercase tracking-wider text-black mb-2">
                      NO HAY GRÁFICOS VISIBLES
                    </h3>
                    <p className="text-gray-600 font-bold">
                      Activa al menos un gráfico desde el panel de personalización
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setShowIncomeChart(true);
                      setShowCategoryChart(true);
                      setShowTrendChart(true);
                    }}
                    className="brutal-button bg-black text-white border-4 border-black font-black px-6 py-3 hover:bg-gray-800 transition-colors duration-200 uppercase tracking-wide"
                  >
                    MOSTRAR GRÁFICOS PRINCIPALES
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
         </motion.div>
      )}
    </div>
  );
}