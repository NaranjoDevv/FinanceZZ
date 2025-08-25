"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  LockClosedIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { useEnhancedReports } from "@/hooks/use-enhanced-reports";
// Removed unused imports
import { FinancialSummaryCard } from "@/components/reports/FinancialSummaryCard";
import { IncomeExpenseChart } from "@/components/reports/IncomeExpenseChart";
import { CategoryDistributionChart } from "@/components/reports/CategoryDistributionChart";
import { MonthlyTrendChart } from "@/components/reports/MonthlyTrendChart";
import { RecurringTransactionsReport } from "@/components/reports/RecurringTransactionsReport";
import { toCurrency, formatCurrency } from "@/lib/currency";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { 
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
import { useBilling } from "@/hooks/useBilling";
import { SubscriptionPopup } from "@/components/billing/SubscriptionPopup";
import { useCurrentUser } from "@/contexts/UserContext";

// Consolidate chart visibility state
interface ChartVisibility {
  income: boolean;
  category: boolean;
  trend: boolean;
  subcategory: boolean;
  recurring: boolean;
}

export default function ReportsPage() {
  const { reportData, isLoading, hasData, hasTransactions, hasRecurringTransactions, refetch } = useEnhancedReports();
  const { currentUser } = useCurrentUser();
  const userCurrency = useMemo(() => toCurrency(currentUser?.currency || 'USD'), [currentUser?.currency]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Este mes');
  
  // Billing verification
  const { isFree, checkAdvancedReportsAccess, showSubscriptionPopup, setShowSubscriptionPopup, currentLimitType } = useBilling();
  const isUserFree = isFree;
  
  // Consolidated customization state
  const [showCustomization, setShowCustomization] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [dateRange, setDateRange] = useState('month');
  const [chartVisibility, setChartVisibility] = useState<ChartVisibility>({
    income: true,
    category: true,
    trend: true,
    subcategory: true,
    recurring: true
  });

  // Memoized handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Reportes actualizados correctamente');
    } catch {
      toast.error('Error al actualizar los reportes');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const toggleChartVisibility = useCallback((chart: keyof ChartVisibility) => {
    setChartVisibility(prev => ({
      ...prev,
      [chart]: !prev[chart]
    }));
  }, []);

  const handleExport = useCallback(() => {
    if (!checkAdvancedReportsAccess()) return;
    
    try {
      if (!reportData || (!hasData && !hasRecurringTransactions)) {
        toast.error('No hay datos suficientes para exportar');
        return;
      }

      const sanitizeValue = (value: number) => isNaN(value) || !isFinite(value) ? 0 : value;

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
          seccionesVisibles: chartVisibility
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
  }, [checkAdvancedReportsAccess, reportData, hasData, hasRecurringTransactions, selectedPeriod, currentUser, hasTransactions, chartType, dateRange, chartVisibility]);

  const handlePeriodChange = useCallback(() => {
    const periods = ['Este mes', 'Últimos 3 meses', 'Últimos 6 meses', 'Este año'];
    const currentIndex = periods.indexOf(selectedPeriod);
    const nextIndex = (currentIndex + 1) % periods.length;
    const nextPeriod = periods[nextIndex];
    if (nextPeriod) {
      setSelectedPeriod(nextPeriod);
      toast.info(`Período cambiado a: ${nextPeriod}`);
    }
  }, [selectedPeriod]);

  // Memoized UI state checks
  const anyChartsVisible = useMemo(() => 
    Object.values(chartVisibility).some(Boolean), 
    [chartVisibility]
  );

  const resetConfiguration = useCallback(() => {
    setChartType('bar');
    setDateRange('month');
    setChartVisibility({
      income: true,
      category: true,
      trend: true,
      subcategory: true,
      recurring: true
    });
    toast.success('Configuración restablecida');
  }, []);

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

  // Show premium message for free users
  if (isUserFree) {
    return (
      <div className="px-6 py-0">
        <div className="mb-8 pt-6">
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black">
            Reportes
          </h1>
          <p className="text-gray-600 font-medium">
            Análisis financiero básico
          </p>
          <div className="w-20 h-1 bg-black mt-4"></div>
        </div>

        <Card className="brutal-card p-8 text-center border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider text-black mb-2">
            Reportes Avanzados - Funcionalidad Premium
          </h3>
          <p className="text-gray-600 font-bold mb-6 max-w-md mx-auto">
            Accede a reportes detallados, gráficos avanzados, análisis de tendencias y exportación de datos con el plan Premium.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Gráficos de distribución por categorías</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Análisis de tendencias mensuales</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Reportes de ingresos vs gastos</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Exportación de datos a JSON</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Análisis de subcategorías</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">Personalización de períodos</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowSubscriptionPopup(true)}
            className="brutal-button brutal-button--primary bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 font-black uppercase tracking-wide"
          >
            <StarIcon className="w-4 h-4 mr-2" />
            Actualizar a Premium
          </Button>
        </Card>

        {/* Basic transaction report for free users */}
        {hasTransactions && (
          <Card className="brutal-card p-6 mt-6">
            <h3 className="text-lg font-black uppercase tracking-wider text-black mb-4">Reporte Básico de Transacciones</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 border-4 border-green-200 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.3)]">
                  <p className="text-sm text-green-600 font-black uppercase">Total Ingresos</p>
                  <p className="text-2xl font-black text-green-700">
                    {formatCurrency(reportData?.totalIncome || 0, userCurrency)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 border-4 border-red-200 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.3)]">
                  <p className="text-sm text-red-600 font-black uppercase">Total Gastos</p>
                  <p className="text-2xl font-black text-red-700">
                    {formatCurrency(reportData?.totalExpenses || 0, userCurrency)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 border-4 border-blue-200 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.3)]">
                  <p className="text-sm text-blue-600 font-black uppercase">Balance</p>
                  <p className={`text-2xl font-black ${
                    (reportData?.totalIncome || 0) - (reportData?.totalExpenses || 0) >= 0 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {formatCurrency((reportData?.totalIncome || 0) - (reportData?.totalExpenses || 0), userCurrency)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center font-bold">
                Actualiza a Premium para acceder a reportes detallados y análisis avanzados
              </p>
            </div>
          </Card>
        )}

        {!hasTransactions && (
          <Card className="brutal-card p-8 text-center mt-6">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-black uppercase tracking-wider text-black mb-2">No hay transacciones</h3>
            <p className="text-gray-600 font-bold mb-4">
              Agrega algunas transacciones para ver tu reporte básico
            </p>
            <Button className="brutal-button">
              Agregar Transacción
            </Button>
          </Card>
        )}

        <SubscriptionPopup 
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
          limitType={currentLimitType}
        />
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
            disabled={!hasData || isUserFree}
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            {isUserFree ? 'Exportar (Premium)' : 'Exportar'}
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
            onClick={() => {
              if (isUserFree) {
                setShowSubscriptionPopup(true);
                return;
              }
              setShowCustomization(!showCustomization);
            }}
          >
            <Cog6ToothIcon className="w-5 h-5 mr-2" />
            {isUserFree ? 'PERSONALIZAR (Premium)' : 'PERSONALIZAR'}
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
                        onClick={() => toggleChartVisibility('income')}
                        className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                      >
                        {chartVisibility.income ? 
                          <EyeIcon className="w-4 h-4 text-black" /> : 
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        }
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                      <span className="text-xs font-black uppercase">CATEGORÍAS</span>
                      <Button
                        onClick={() => toggleChartVisibility('category')}
                        className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                      >
                        {chartVisibility.category ? 
                          <EyeIcon className="w-4 h-4 text-black" /> : 
                          <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                        }
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">TENDENCIAS</span>
                       <Button
                         onClick={() => toggleChartVisibility('trend')}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {chartVisibility.trend ? 
                           <EyeIcon className="w-4 h-4 text-black" /> : 
                           <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                         }
                       </Button>
                     </div>
                     <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">SUBCATEGORÍAS</span>
                       <Button
                         onClick={() => toggleChartVisibility('subcategory')}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {chartVisibility.subcategory ? 
                           <EyeIcon className="w-4 h-4 text-black" /> : 
                           <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                         }
                       </Button>
                     </div>
                     <div className="flex items-center justify-between p-2 border-2 border-black bg-gray-50">
                       <span className="text-xs font-black uppercase">RECURRENTES</span>
                       <Button
                         onClick={() => toggleChartVisibility('recurring')}
                         className="p-1 border-2 border-black bg-white hover:bg-gray-100"
                       >
                         {chartVisibility.recurring ? 
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
                    onClick={resetConfiguration}
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
          {chartVisibility.recurring && (
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
          {anyChartsVisible ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chartVisibility.income && (
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
              
              {chartVisibility.category && (
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
              {chartVisibility.trend && (
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
              {chartVisibility.subcategory && reportData.subcategoryDistribution.length > 0 && (
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
                      setChartVisibility(prev => ({
                        ...prev,
                        income: true,
                        category: true,
                        trend: true
                      }));
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