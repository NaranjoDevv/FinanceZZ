"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  MinusIcon
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

export default function DebtsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="brutal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Total Me Deben
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.totalOwedToMe || 0, userCurrency, user?.numberRounding || false)}
                  fullValue={formatCurrency(stats.totalOwedToMe || 0, userCurrency)}
                  amount={stats.totalOwedToMe || 0}
                  currency={userCurrency}
                  useRounding={user?.numberRounding || false}
                >
                  <p className="text-2xl font-black text-green-600 transition-colors duration-200 cursor-help">
                    {formatCurrencyWithRounding(stats.totalOwedToMe || 0, userCurrency, user?.numberRounding || false)}
                  </p>
                </BalanceTooltip>
              </div>
              <PlusIcon className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="brutal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Total Debo
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.totalIOwe || 0, userCurrency, user?.numberRounding || false)}
                  fullValue={formatCurrency(stats.totalIOwe || 0, userCurrency)}
                  amount={stats.totalIOwe || 0}
                  currency={userCurrency}
                  useRounding={user?.numberRounding || false}
                >
                  <p className="text-2xl font-black text-red-600 transition-colors duration-200 cursor-help">
                    {formatCurrencyWithRounding(stats.totalIOwe || 0, userCurrency, user?.numberRounding || false)}
                  </p>
                </BalanceTooltip>
              </div>
              <MinusIcon className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="brutal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Deudas Activas
                </p>
                <p className="text-2xl font-black text-gray-900 transition-colors duration-200">
                  {stats.activeDebts || 0}
                </p>
              </div>
              <ClockIconSolid className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="brutal-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-gray-600 mb-1 transition-colors duration-200">
                  Vencidas
                </p>
                <p className="text-2xl font-black text-red-600 transition-colors duration-200">
                  {stats.overdueDebts || 0}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
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

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Buscar por descripción o persona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutal-input pl-12 h-12 font-medium"
            />
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`brutal-button h-12 ${showFilters ? 'bg-black text-white' : ''}`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-black uppercase tracking-wider text-gray-600 mb-2 block">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="brutal-input h-12 font-medium w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="open">Abierta</SelectItem>
                  <SelectItem value="partially_paid">Parcialmente Pagada</SelectItem>
                  <SelectItem value="paid">Pagada</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-black uppercase tracking-wider text-gray-600 mb-2 block">
                Tipo
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="brutal-input h-12 font-medium w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="owes_me">Me Deben</SelectItem>
                  <SelectItem value="i_owe">Debo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Debts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {isLoading ? (
          <Card className="brutal-card p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">Cargando deudas...</p>
            </div>
          </Card>
        ) : filteredDebts.length === 0 ? (
          <Card className="brutal-card p-6">
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">
                {debts?.length === 0
                  ? "No tienes deudas registradas. ¡Crea tu primera deuda!"
                  : "No se encontraron deudas con los filtros aplicados."
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDebts.map((debt: Debt, index: number) => (
              <motion.div
                key={debt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="brutal-card p-6 hover:shadow-brutal-lg transition-all duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`font-black text-lg ${getDebtTypeColor(debt.type)}`}>
                          {getDebtTypeText(debt.type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 ${getStatusColor(debt.status)}`}>
                          {getStatusText(debt.status)}
                        </span>
                      </div>

                      <h3 className="text-xl font-black mb-2">{debt.description}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{debt.counterpartyName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {formatCurrency(debt.currentAmount, userCurrency)}
                            {debt.originalAmount !== debt.currentAmount && (
                              <span className="text-gray-400 ml-1">
                                (de {formatCurrency(debt.originalAmount, userCurrency)})
                              </span>
                            )}
                          </span>
                        </div>

                        {debt.dueDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              Vence: {formatDate(debt.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEditDebt(debt)}
                        className="brutal-button p-3 hover:bg-blue-500 hover:text-white transition-all duration-200"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>

                      <Button
                        onClick={() => handleDeleteDebt(debt)}
                        className="brutal-button p-3 hover:bg-red-500 hover:text-white transition-all duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
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