"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBilling } from "@/hooks/useBilling";
import NewRecurringTransactionModal from "@/components/forms/NewRecurringTransactionModal";
import EditRecurringTransactionModal from "@/components/forms/EditRecurringTransactionModal";
import DeleteRecurringTransactionModal from "@/components/forms/DeleteRecurringTransactionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";



export default function RecurringTransactionsPage() {
  const recurringTransactionsQuery = useQuery(api.recurringTransactions.getRecurringTransactions);
  const isLoading = recurringTransactionsQuery === undefined;
  const { billingInfo, isFree, getUsagePercentage } = useBilling();
  
  const recurringTransactions = useMemo(() => {
    return recurringTransactionsQuery || [];
  }, [recurringTransactionsQuery]);

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!recurringTransactions) return [];
    return recurringTransactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && transaction.isActive) ||
        (statusFilter === "paused" && !transaction.isActive);
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesFrequency = frequencyFilter === "all" || transaction.recurringFrequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesType && matchesFrequency;
    });
  }, [recurringTransactions, searchTerm, statusFilter, typeFilter, frequencyFilter]);

  // Memoized statistics
  const stats = useMemo(() => {
    if (!recurringTransactions) return { total: 0, active: 0, paused: 0, monthlyImpact: 0 };
    
    const activeTransactions = recurringTransactions.filter(t => t.isActive);
    const pausedTransactions = recurringTransactions.filter(t => !t.isActive);
    
    const monthlyImpact = activeTransactions.reduce((total, transaction) => {
      let monthlyAmount = 0;
      switch (transaction.recurringFrequency) {
        case "daily":
          monthlyAmount = transaction.amount * 30;
          break;
        case "weekly":
          monthlyAmount = transaction.amount * 4;
          break;
        case "monthly":
          monthlyAmount = transaction.amount;
          break;
        case "yearly":
          monthlyAmount = transaction.amount / 12;
          break;
        default:
          monthlyAmount = 0;
      }
      return total + monthlyAmount;
    }, 0);

    return {
      total: recurringTransactions.length,
      active: activeTransactions.length,
      paused: pausedTransactions.length,
      monthlyImpact
    };
  }, [recurringTransactions]);

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="mb-8 pt-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
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
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
          Transacciones Recurrentes
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Automatiza tus finanzas • Controla tu futuro
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Usage Indicator for Free Users */}
      {isFree && billingInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="brutal-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Transacciones recurrentes</span>
              <span className="text-sm font-bold text-gray-600">
                {billingInfo.usage.recurringTransactions}/{billingInfo.limits.recurringTransactions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  getUsagePercentage('recurring_transactions') >= 80 
                    ? 'bg-red-500' 
                    : getUsagePercentage('recurring_transactions') >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(getUsagePercentage('recurring_transactions'), 100)}%`,
                }}
              />
            </div>
            {getUsagePercentage('recurring_transactions') >= 80 && (
              <p className="text-xs text-red-600 font-bold mt-2">
                {getUsagePercentage('recurring_transactions') >= 100 
                  ? "🚫 Has alcanzado el límite máximo" 
                  : "⚠  Te estás acercando al límite"
                }
              </p>
            )}
          </Card>
        </motion.div>
      )}

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
            onClick={() => setIsNewModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Recurrente
          </Button>

          <Button 
            className={`brutal-button transition-all duration-300 ${
              showFilters 
                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105' 
                : 'bg-white text-black border-black hover:bg-gray-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            FILTROS
            <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-300 ${
              showFilters ? 'rotate-180' : 'rotate-0'
            }`} />
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 text-white rounded-none">
                  <PlayIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Transacciones Activas
              </h3>
              <p className="text-2xl font-black text-green-600 transition-colors duration-200">{stats.active}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 text-white rounded-none">
                  <PauseIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Transacciones Pausadas
              </h3>
              <p className="text-2xl font-black text-orange-600 transition-colors duration-200">{stats.paused}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500 text-white rounded-none">
                  <ArrowPathIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Impacto Mensual
              </h3>
              <p className={`text-2xl font-black transition-colors duration-200 ${
                stats.monthlyImpact >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats.monthlyImpact)}
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              height: "auto", 
              y: 0,
              transition: {
                duration: 0.4,
                ease: "easeInOut",
                height: { delay: 0.1, duration: 0.3 }
              }
            }}
            exit={{ 
              opacity: 0, 
              height: 0, 
              y: -20,
              transition: {
                duration: 0.3,
                ease: "easeInOut",
                height: { delay: 0.1, duration: 0.2 }
              }
            }}
            className="mb-6 overflow-hidden"
          >
            <Card className="brutal-card p-5 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-6 bg-black flex items-center justify-center">
                  <FunnelIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-black">
                  FILTROS AVANZADOS
                </h3>
                <div className="flex-1 h-1 bg-black"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    BUSCAR TRANSACCIONES
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="BUSCAR TRANSACCIONES..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-4 border-black font-black text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 bg-white uppercase tracking-wide text-sm transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    ESTADO
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full h-12 border-4 border-black font-black text-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                      <SelectValue placeholder="SELECCIONAR ESTADO" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="all" className="font-black uppercase">TODAS</SelectItem>
                      <SelectItem value="active" className="font-black uppercase text-green-600">ACTIVAS</SelectItem>
                      <SelectItem value="paused" className="font-black uppercase text-orange-600">PAUSADAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    TIPO
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full h-12 border-4 border-black font-black text-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                      <SelectValue placeholder="SELECCIONAR TIPO" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="all" className="font-black uppercase">TODOS</SelectItem>
                      <SelectItem value="income" className="font-black uppercase text-green-600">INGRESOS</SelectItem>
                      <SelectItem value="expense" className="font-black uppercase text-red-600">GASTOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black">
                    FRECUENCIA
                  </label>
                  <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                    <SelectTrigger className="w-full h-12 border-4 border-black font-black text-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                      <SelectValue placeholder="SELECCIONAR FRECUENCIA" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="all" className="font-black uppercase">TODAS</SelectItem>
                      <SelectItem value="daily" className="font-black uppercase">DIARIO</SelectItem>
                      <SelectItem value="weekly" className="font-black uppercase">SEMANAL</SelectItem>
                      <SelectItem value="monthly" className="font-black uppercase">MENSUAL</SelectItem>
                      <SelectItem value="yearly" className="font-black uppercase">ANUAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Filter Summary */}
              <div className="mt-5 pt-4 border-t-4 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wide">
                    <span className="text-gray-600">RESULTADOS:</span>
                    <span className="text-black">{filteredTransactions.length} TRANSACCIONES</span>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setFrequencyFilter("all");
                    }}
                    className="bg-gray-100 text-black border-2 border-black font-black text-xs px-3 py-1 hover:bg-gray-200 transition-colors duration-200 uppercase tracking-wide"
                  >
                    LIMPIAR FILTROS
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Selector */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-wide text-black">
            Vista de Transacciones
          </h3>
          <div className="flex gap-2">
            <Button
              className={`brutal-button brutal-button--small ${
                viewMode === "list" 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
              onClick={() => setViewMode("list")}
            >
              <ListBulletIcon className="w-4 h-4 mr-2" />
              LISTA
            </Button>
            <Button
              className={`brutal-button brutal-button--small ${
                viewMode === "grid" 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Squares2X2Icon className="w-4 h-4 mr-2" />
              GRID
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <span className="text-sm font-black uppercase tracking-wide text-gray-600">
            TOTAL: {filteredTransactions.length} TRANSACCIONES
          </span>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="brutal-card p-5">
          <h3 className="text-lg font-black uppercase tracking-wide mb-5 text-black transition-colors duration-200">
            Transacciones Recurrentes ({filteredTransactions.length})
          </h3>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-lg font-black uppercase tracking-wide mb-2">No hay transacciones recurrentes</h3>
              <p className="text-gray-600 font-medium mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all" || frequencyFilter !== "all"
                  ? "No se encontraron transacciones con los filtros aplicados"
                  : "Comienza creando tu primera transacción recurrente"}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && frequencyFilter === "all" && (
                <Button 
                  className="brutal-button brutal-button--primary"
                  onClick={() => setIsNewModalOpen(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primera Transacción
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" 
              : "space-y-2"
            }>
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group brutal-card p-3 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <h4 className="font-black text-sm uppercase tracking-wide truncate max-w-[150px]">
                        {transaction.description}
                      </h4>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        className="brutal-button brutal-button--small px-2 py-1"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <PencilIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        className="brutal-button brutal-button--small brutal-button--danger px-2 py-1"
                        onClick={() => handleDeleteTransaction(transaction)}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                     <div className={`text-lg font-black ${
                       transaction.type === "expense" ? "text-red-600" : "text-green-600"
                     }`}>
                       {transaction.type === "expense" ? "-" : "+"}{formatCurrency(transaction.amount)}
                     </div>
                    <div className="flex gap-1">
                      <Badge
                        className={`font-bold uppercase text-xs border-2 px-1 py-0 ${
                          transaction.type === "expense"
                            ? "bg-red-100 text-red-800 border-red-800"
                            : "bg-green-100 text-green-800 border-green-800"
                        }`}
                      >
                        {transaction.type === "expense" ? "GAS" : "ING"}
                      </Badge>
                      <Badge
                        className="font-bold uppercase text-xs border-2 px-1 py-0 bg-gray-100 text-gray-800 border-gray-800"
                      >
                        {transaction.recurringFrequency === "daily" ? "DIA" :
        transaction.recurringFrequency === "weekly" ? "SEM" :
        transaction.recurringFrequency === "monthly" ? "MES" : "AÑO"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>
                      <strong>Próxima:</strong> {transaction.nextExecutionDate ? new Date(transaction.nextExecutionDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                    </div>
                    <div>
                      <strong>Ejecuciones:</strong> {transaction.totalExecutions}
                    </div>
                  </div>
                  
                  {transaction.categoryName && (
                    <div className="mt-1 text-xs text-gray-600 truncate">
                      <strong>Cat:</strong> {transaction.categoryName || 'Sin categoría'}
        {transaction.subcategoryName && ` > ${transaction.subcategoryName}`}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modals */}
      <NewRecurringTransactionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {selectedTransaction && (
        <EditRecurringTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />
      )}

      {selectedTransaction && (
        <DeleteRecurringTransactionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}