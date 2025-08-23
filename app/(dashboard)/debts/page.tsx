"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ClockIcon as ClockIconSolid,
  MinusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { useDebts } from "@/hooks/use-debts";
import NewDebtModal from "@/components/forms/NewDebtModal";
import EditDebtModal from "@/components/forms/EditDebtModal";
import DeleteDebtModal from "@/components/forms/DeleteDebtModal";
import { formatCurrency, formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { BalanceTooltip } from "@/components/ui/balance-tooltip";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Debt {
  _id: string;
  type: 'owes_me' | 'i_owe';
  originalAmount: number;
  currentAmount: number;
  description: string;
  counterpartyName: string;
  counterpartyContact?: string;
  startDate: number;
  dueDate?: number;
  status: 'open' | 'paid' | 'overdue' | 'partially_paid';
  interestRate?: number;
  notes?: string;
}

// Componente para deuda en vista de cuadrícula
function GridDebt({ debt, getStatusText, getStatusColor, getDebtTypeText, getDebtTypeColor, formatDate, handleEditDebt, handleDeleteDebt, userCurrency }: {
  debt: Debt;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  getDebtTypeText: (type: 'owes_me' | 'i_owe') => string;
  getDebtTypeColor: (type: 'owes_me' | 'i_owe') => string;
  formatDate: (timestamp: number) => string;
  handleEditDebt: (debt: Debt) => void;
  handleDeleteDebt: (debt: Debt) => void;
  userCurrency: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative p-4 border-2 border-gray-200 hover:border-black transition-all duration-200 group"
    >
      {/* Header with type and status */}
      <div className="flex items-start justify-between mb-3">
        <span className={`font-black text-sm ${getDebtTypeColor(debt.type)}`}>
          {getDebtTypeText(debt.type)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${getStatusColor(debt.status)}`}>
          {getStatusText(debt.status)}
        </span>
      </div>

      {/* Description */}
      <h4 className="font-bold text-sm uppercase tracking-wide mb-2 leading-tight">
        {debt.description}
      </h4>

      {/* Details */}
      <div className="space-y-1 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <UserIcon className="w-3 h-3" />
          <span className="font-medium">{debt.counterpartyName}</span>
        </div>
        <div className="flex items-center gap-1">
          <CurrencyDollarIcon className="w-3 h-3" />
          <span className="font-bold">{formatCurrency(debt.currentAmount, userCurrency)}</span>
        </div>
        {debt.dueDate && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            <span>Vence: {formatDate(debt.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleEditDebt(debt)}
          className="flex-1 p-2 bg-blue-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-blue-500 hover:bg-white hover:text-blue-500 transition-all duration-200"
        >
          <PencilIcon className="w-3 h-3 mx-auto" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDeleteDebt(debt)}
          className="flex-1 p-2 bg-red-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-red-500 hover:bg-white hover:text-red-500 transition-all duration-200"
        >
          <TrashIcon className="w-3 h-3 mx-auto" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function DebtsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modal states
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [isEditDebtModalOpen, setIsEditDebtModalOpen] = useState(false);
  const [isDeleteDebtModalOpen, setIsDeleteDebtModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const { debts, stats, isLoading } = useDebts();
  const user = useQuery(api.users.getCurrentUser);

  const userCurrency = toCurrency(user?.currency || 'USD');

  const filteredDebts = useMemo(() => {
    if (!debts) return [];

    return debts.filter((debt: Debt) => {
      const matchesSearch =
        debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debt.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || debt.status === statusFilter;
      const matchesType = typeFilter === "all" || debt.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [debts, searchTerm, statusFilter, typeFilter]);



  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const getStatusText = (status: string) => {
    const statusMap = {
      'open': 'Abierta',
      'paid': 'Pagada',
      'overdue': 'Vencida',
      'partially_paid': 'Parcialmente Pagada'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'partially_paid':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDebtTypeText = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'Me Deben' : 'Debo';
  };

  const getDebtTypeColor = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'text-green-600' : 'text-red-600';
  };

  const handleEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsEditDebtModalOpen(true);
  };

  const handleDeleteDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDeleteDebtModalOpen(true);
  };

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
          Deudas
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Administra tus deudas y pagos pendientes
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
        >
          <Card className="brutal-card p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Total Me Deben
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.totalOwedToMe || 0, userCurrency, user?.numberRounding || false)}
                  fullValue={formatCurrency(stats.totalOwedToMe || 0, userCurrency)}
                  amount={stats.totalOwedToMe || 0}
                  currency={userCurrency}
                  useRounding={user?.numberRounding || false}
                >
                  <p className="text-sm sm:text-2xl font-black text-green-600 transition-colors duration-200 cursor-help">
                    {formatCurrencyWithRounding(stats.totalOwedToMe || 0, userCurrency, user?.numberRounding || false)}
                  </p>
                </BalanceTooltip>
              </div>
              <PlusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </Card>

          <Card className="brutal-card p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Total Debo
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.totalIOwe || 0, userCurrency, user?.numberRounding || false)}
                  fullValue={formatCurrency(stats.totalIOwe || 0, userCurrency)}
                  amount={stats.totalIOwe || 0}
                  currency={userCurrency}
                  useRounding={user?.numberRounding || false}
                >
                  <p className="text-sm sm:text-2xl font-black text-red-600 transition-colors duration-200 cursor-help">
                    {formatCurrencyWithRounding(stats.totalIOwe || 0, userCurrency, user?.numberRounding || false)}
                  </p>
                </BalanceTooltip>
              </div>
              <MinusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </Card>

          <Card className="brutal-card p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Deudas Activas
                </p>
                <p className="text-sm sm:text-2xl font-black text-gray-900 transition-colors duration-200">
                  {stats.activeDebts || 0}
                </p>
              </div>
              <ClockIconSolid className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="brutal-card p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Vencidas
                </p>
                <p className="text-sm sm:text-2xl font-black text-red-600 transition-colors duration-200">
                  {stats.overdueDebts || 0}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            className="brutal-button brutal-button--primary"
            onClick={() => setIsNewDebtModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Deuda
          </Button>
          <Button className="brutal-button">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Contactos
          </Button>
          <Button className="brutal-button">
            <ClockIcon className="w-5 h-5 mr-2" />
            Recordatorios
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button 
            className={`brutal-button ${showFilters ? 'bg-black text-white' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
               initial={{ opacity: 0, y: -20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: "auto" }}
               exit={{ opacity: 0, y: -20, height: 0 }}
               transition={{ 
                 duration: 0.4,
                 ease: "easeInOut",
                 height: { delay: 0.1, duration: 0.3 }
               }}
               className="mb-6 sm:mb-8"
             >
              <Card className="brutal-card p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar deudas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600 text-sm sm:text-base"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="open">Abierta</SelectItem>
                          <SelectItem value="partially_paid">Parcialmente Pagada</SelectItem>
                          <SelectItem value="paid">Pagada</SelectItem>
                          <SelectItem value="overdue">Vencida</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-40 h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="owes_me">Me Deben</SelectItem>
                          <SelectItem value="i_owe">Debo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Debts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wide">
                Lista de Deudas ({filteredDebts.length})
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-2 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 border-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">Cargando deudas...</p>
              </div>
            ) : filteredDebts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {debts?.length === 0
                    ? "No tienes deudas aún"
                    : "No se encontraron deudas con los filtros aplicados"
                  }
                </p>
                {debts?.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    Crea tu primera deuda para organizar tus finanzas
                  </p>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredDebts.map((debt: Debt, index: number) => (
                  <motion.div
                    key={debt._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.0 }}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 border-gray-200 hover:border-black transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-black text-sm ${getDebtTypeColor(debt.type)}`}>
                            {getDebtTypeText(debt.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${getStatusColor(debt.status)}`}>
                            {getStatusText(debt.status)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm md:text-base uppercase tracking-wide truncate leading-tight mb-1">
                          {debt.description}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            <span className="font-medium">{debt.counterpartyName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3" />
                            <span className="font-bold">{formatCurrency(debt.currentAmount, userCurrency)}</span>
                          </div>
                          {debt.dueDate && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>Vence: {formatDate(debt.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 md:gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 mt-2 sm:mt-0">
                      <motion.button
                        onClick={() => handleEditDebt(debt)}
                        className="brutal-button p-1.5 md:p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Editar deuda"
                      >
                        <PencilIcon className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteDebt(debt)}
                        className="brutal-button p-1.5 md:p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Eliminar deuda"
                      >
                        <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDebts.map((debt) => (
                  <GridDebt
                    key={debt._id}
                    debt={debt}
                    getStatusText={getStatusText}
                    getStatusColor={getStatusColor}
                    getDebtTypeText={getDebtTypeText}
                    getDebtTypeColor={getDebtTypeColor}
                    formatDate={formatDate}
                    handleEditDebt={handleEditDebt}
                    handleDeleteDebt={handleDeleteDebt}
                    userCurrency={userCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <NewDebtModal
        isOpen={isNewDebtModalOpen}
        onClose={() => setIsNewDebtModalOpen(false)}
      />

      <EditDebtModal
        isOpen={isEditDebtModalOpen}
        onClose={() => {
          setIsEditDebtModalOpen(false);
          setSelectedDebt(null);
        }}
        debt={selectedDebt}
      />

      <DeleteDebtModal
        isOpen={isDeleteDebtModalOpen}
        onClose={() => {
          setIsDeleteDebtModalOpen(false);
          setSelectedDebt(null);
        }}
        debt={selectedDebt}
      />
    </div>
  );
}