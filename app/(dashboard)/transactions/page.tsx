"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon,
  Squares2X2Icon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { BalanceTooltip } from "@/components/ui/balance-tooltip";
import NewTransactionModal from "@/components/forms/NewTransactionModal";
import EditTransactionModal from "@/components/forms/EditTransactionModal";
import DeleteTransactionModal from "@/components/forms/DeleteTransactionModal";
import { useBilling } from "@/hooks/useBilling";
import { SubscriptionPopup } from "@/components/billing/SubscriptionPopup";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Transaction {
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
}

const types = ["Todos", "Ingresos", "Gastos"];

// Componente para transacción en vista de cuadrícula
function GridTransaction({ transaction, hoveredTransaction, setHoveredTransaction, setSelectedTransaction, setIsEditModalOpen, setIsDeleteModalOpen, userCurrency }: {
  transaction: Transaction;
  hoveredTransaction: string | null;
  setHoveredTransaction: (id: string | null) => void;
  setSelectedTransaction: (transaction: Transaction) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  userCurrency: import('@/lib/currency').Currency;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 border-2 transition-all duration-200 group ${
        hoveredTransaction === transaction._id
          ? 'border-black bg-gray-50'
          : 'border-gray-200 hover:border-black'
      }`}
      onMouseEnter={() => setHoveredTransaction(transaction._id)}
      onMouseLeave={() => setHoveredTransaction(null)}
    >
      {/* Header with icon and amount */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-none flex-shrink-0 ${
          (transaction.type === 'income' || transaction.type === 'loan_received') ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {(transaction.type === 'income' || transaction.type === 'loan_received') ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
        </div>
        <div className="text-right">
          <p className={`text-lg font-black ${
            (transaction.type === 'income' || transaction.type === 'loan_received') ? 'text-green-600' : 'text-red-600'
          }`}>
            {(transaction.type === 'income' || transaction.type === 'loan_received') ? '+' : '-'}
            {formatCurrency(transaction.amount, userCurrency).replace(/^[^\d-+]*/, '')}
          </p>
        </div>
      </div>

      {/* Description */}
      <h4 className="font-bold text-sm uppercase tracking-wide mb-2 leading-tight">
        {transaction.description}
      </h4>

      {/* Category and Date */}
      <div className="space-y-1 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <span className="font-medium">{transaction.category?.name || 'Sin categoría'}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="w-3 h-3" />
          <span>{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {transaction.notes}
        </p>
      )}

      {/* Action Buttons */}
      <div className={`flex gap-1 transition-all duration-200 ${
        hoveredTransaction === transaction._id
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedTransaction(transaction);
            setIsEditModalOpen(true);
          }}
          className="flex-1 p-2 bg-blue-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-blue-500 hover:bg-white hover:text-blue-500 transition-all duration-200"
        >
          <PencilIcon className="w-3 h-3 mx-auto" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedTransaction(transaction);
            setIsDeleteModalOpen(true);
          }}
          className="flex-1 p-2 bg-red-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-red-500 hover:bg-white hover:text-red-500 transition-all duration-200"
        >
          <TrashIcon className="w-3 h-3 mx-auto" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Componente para transacción arrastrable
function SortableTransaction({ transaction, index, hoveredTransaction, setHoveredTransaction, setSelectedTransaction, setIsEditModalOpen, setIsDeleteModalOpen, userCurrency }: {
  transaction: Transaction;
  index: number;
  hoveredTransaction: string | null;
  setHoveredTransaction: (id: string | null) => void;
  setSelectedTransaction: (transaction: Transaction) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  userCurrency: import('@/lib/currency').Currency;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: transaction._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      transition={{ delay: isDragging ? 0 : 0.6 + index * 0.05 }}
      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 transition-all duration-200 group ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 rotate-2' 
          : 'border-gray-200 hover:border-black'
      }`}
      onMouseEnter={() => !isDragging && setHoveredTransaction(transaction._id)}
      onMouseLeave={() => setHoveredTransaction(null)}
    >
      {/* Mobile Layout */}
      <div className="flex sm:hidden w-full">
        {/* Top Row: Icon, Description, Amount */}
        <div className="flex items-start flex-1 gap-2">
          <div className={`p-1.5 rounded-none flex-shrink-0 ${
            (transaction.type === 'income' || transaction.type === 'loan_received') ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {(transaction.type === 'income' || transaction.type === 'loan_received') ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs uppercase tracking-wide truncate leading-tight">
              {transaction.description}
            </h4>
            <div className="flex flex-col space-y-0.5 text-xs text-gray-600 mt-0.5">
              <span className="font-medium truncate">{transaction.category?.name || 'Sin categoría'}</span>
              <span className="text-xs">{new Date(transaction.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-1">
            <p className={`text-xs font-black ${
              (transaction.type === 'income' || transaction.type === 'loan_received') ? 'text-green-600' : 'text-red-600'
            }`}>
              {(transaction.type === 'income' || transaction.type === 'loan_received') ? '+' : '-'}
              {formatCurrency(transaction.amount, userCurrency).replace(/^[^\d-+]*/, '')}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Row: Notes and Actions */}
      <div className="flex sm:hidden w-full mt-2 justify-between items-center">
        <div className="flex-1">
          {transaction.notes && (
            <p className="text-xs text-gray-500 truncate">
              {transaction.notes}
            </p>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          <motion.button
            onClick={() => {
              setSelectedTransaction(transaction);
              setIsEditModalOpen(true);
            }}
            className="brutal-button p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Editar transacción"
          >
            <PencilIcon className="w-3 h-3" />
          </motion.button>
          <motion.button
            onClick={() => {
              setSelectedTransaction(transaction);
              setIsDeleteModalOpen(true);
            }}
            className="brutal-button p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Eliminar transacción"
          >
            <TrashIcon className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-start w-full">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 transition-colors rounded flex-shrink-0 ${
            isDragging 
              ? 'cursor-grabbing text-blue-600 bg-blue-100' 
              : 'cursor-grab text-gray-400 hover:bg-gray-100'
          }`}
          title="Arrastrar para reordenar"
        >
          <Bars3Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>

        <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
          <div className={`p-2 md:p-3 rounded-none flex-shrink-0 ${
            (transaction.type === 'income' || transaction.type === 'loan_received') ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {(transaction.type === 'income' || transaction.type === 'loan_received') ? (
              <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm md:text-base uppercase tracking-wide truncate leading-tight">
              {transaction.description}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs md:text-sm text-gray-600 mt-0.5">
              <span className="font-medium truncate">{transaction.category?.name || 'Sin categoría'}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs md:text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            {transaction.notes && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {transaction.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-2">
          <div className="text-right">
            <p className={`text-sm md:text-lg font-black ${
              (transaction.type === 'income' || transaction.type === 'loan_received') ? 'text-green-600' : 'text-red-600'
            }`}>
              {(transaction.type === 'income' || transaction.type === 'loan_received') ? '+' : '-'}
              {formatCurrency(transaction.amount, userCurrency).replace(/^[^\d-+]*/, '')}
            </p>
          </div>

          {/* Action Buttons - Show on hover (hidden during drag) */}
          <div className={`flex gap-1 md:gap-2 transition-all duration-200 ${
            hoveredTransaction === transaction._id && !isDragging
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-4 pointer-events-none'
          }`}>
            <motion.button
              onClick={() => {
                setSelectedTransaction(transaction);
                setIsEditModalOpen(true);
              }}
              className="brutal-button p-1.5 md:p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Editar transacción"
            >
              <PencilIcon className="w-3 h-3 md:w-4 md:h-4" />
            </motion.button>
            <motion.button
              onClick={() => {
                setSelectedTransaction(transaction);
                setIsDeleteModalOpen(true);
              }}
              className="brutal-button p-1.5 md:p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Eliminar transacción"
            >
              <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TransactionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hoveredTransaction, setHoveredTransaction] = useState<string | null>(null);
  const [orderedTransactions, setOrderedTransactions] = useState<Transaction[]>([]);

  const { transactions, isLoading, error, isAuthenticated } = useTransactions();
  const user = useQuery(api.users.getCurrentUser);
  const userCurrency = toCurrency(user?.currency || 'USD');
  
  // Billing hook for transaction limits
  const { 
    checkTransactionLimit, 
    showSubscriptionPopup, 
    setShowSubscriptionPopup, 
    currentLimitType, 
    billingInfo,
    getUsagePercentage,
    isFree 
  } = useBilling();

  // Funciones para manejar localStorage
  const saveOrderToLocalStorage = (order: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('transactionOrder', JSON.stringify(order));
    }
  };

  const loadOrderFromLocalStorage = (): string[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transactionOrder');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  };

  // Handle new transaction with billing validation
  const handleNewTransaction = async () => {
    const canProceed = await checkTransactionLimit();
    if (canProceed) {
      setIsNewTransactionModalOpen(true);
    }
    // If cannot proceed, useBilling automatically shows the subscription popup
  };

  // Sincronizar transacciones con el estado ordenado
  useEffect(() => {
    if (transactions.length > 0) {
      const savedOrder = loadOrderFromLocalStorage();
      
      if (savedOrder.length > 0) {
        // Ordenar según el orden guardado
        const orderedByStorage = [...transactions].sort((a, b) => {
          const indexA = savedOrder.indexOf(a._id);
          const indexB = savedOrder.indexOf(b._id);
          
          // Si ambos están en el orden guardado, usar ese orden
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // Si solo uno está en el orden guardado, ponerlo primero
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // Si ninguno está en el orden guardado, mantener orden original
          return 0;
        });
        setOrderedTransactions(orderedByStorage);
      } else {
        setOrderedTransactions(transactions);
      }
    }
  }, [transactions]);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejar el final del arrastre
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedTransactions((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Guardar el nuevo orden en localStorage
        const orderIds = newOrder.map(item => item._id);
        saveOrderToLocalStorage(orderIds);
        
        return newOrder;
      });
    }
  }

  if (isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="mb-8 pt-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium text-lg">
            Debes iniciar sesión para ver tus transacciones
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-0">
        <div className="text-center py-12">
          <p className="text-red-500 font-medium text-lg">
            Error al cargar las transacciones: {error}
          </p>
        </div>
      </div>
    );
  }

  const filteredTransactions = orderedTransactions.filter(transaction => {
    const categoryName = transaction.category?.name || "Sin categoría";
    const matchesCategory = selectedCategory === "Todos" || categoryName === selectedCategory;
    const matchesType = selectedType === "Todos" ||
      (selectedType === "Ingresos" && (transaction.type === "income" || transaction.type === "loan_received")) ||
      (selectedType === "Gastos" && (transaction.type === "expense" || transaction.type === "debt_payment"));
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesType && matchesSearch;
  });

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income' || t.type === 'loan_received')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === 'expense' || t.type === 'debt_payment')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Get unique categories from transactions
  const categories: string[] = ["Todos", ...Array.from<string>(new Set(transactions.map((t: Transaction) => t.category?.name || "Sin categoría")))];

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
          Transacciones
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Gestiona tus ingresos y gastos
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
              <span className="text-sm font-bold text-gray-700">Transacciones este mes</span>
              <span className="text-sm font-bold text-gray-600">
                {billingInfo.usage.monthlyTransactions}/{billingInfo.limits.monthlyTransactions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  getUsagePercentage('transactions') >= 80 
                    ? 'bg-red-500' 
                    : getUsagePercentage('transactions') >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(getUsagePercentage('transactions'), 100)}%` }}
              />
            </div>
            {getUsagePercentage('transactions') >= 80 && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                ¡Estás cerca del límite! Actualiza a Premium para transacciones ilimitadas.
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
        className="mb-8"
      >
        <div className="flex flex-wrap gap-4">
          <Button
            className="brutal-button brutal-button--primary"
            onClick={handleNewTransaction}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Transacción
          </Button>
          <Button 
            className={`brutal-button ${showFilters ? 'bg-black text-white' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-500 text-white rounded-none">
                  <ArrowUpIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Total Ingresos
              </h3>
              <BalanceTooltip
                value={formatCurrencyWithRounding(totalIncome, userCurrency, user?.numberRounding || false)}
                fullValue={formatCurrency(totalIncome, userCurrency)}
                amount={totalIncome}
                currency={userCurrency}
                useRounding={user?.numberRounding || false}
              >
                <p className="text-sm sm:text-2xl font-black text-green-600 transition-colors duration-200 cursor-help">
                  {formatCurrencyWithRounding(totalIncome, userCurrency, user?.numberRounding || false)}
                </p>
              </BalanceTooltip>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-500 text-white rounded-none">
                  <ArrowDownIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Total Gastos
              </h3>
              <BalanceTooltip
                value={formatCurrencyWithRounding(totalExpenses, userCurrency, user?.numberRounding || false)}
                fullValue={formatCurrency(totalExpenses, userCurrency)}
                amount={totalExpenses}
                currency={userCurrency}
                useRounding={user?.numberRounding || false}
              >
                <p className="text-sm sm:text-2xl font-black text-red-600 transition-colors duration-200 cursor-help">
                  {formatCurrencyWithRounding(totalExpenses, userCurrency, user?.numberRounding || false)}
                </p>
              </BalanceTooltip>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 text-white rounded-none">
                  <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Balance
              </h3>
              <BalanceTooltip
                value={formatCurrencyWithRounding(balance, userCurrency, user?.numberRounding || false)}
                fullValue={formatCurrency(balance, userCurrency)}
                amount={balance}
                currency={userCurrency}
                useRounding={user?.numberRounding || false}
              >
                <p className={`text-sm sm:text-2xl font-black transition-colors duration-200 cursor-help ${balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {formatCurrencyWithRounding(balance, userCurrency, user?.numberRounding || false)}
                </p>
              </BalanceTooltip>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500 text-white rounded-none">
                  <Bars3Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Total Transacciones
              </h3>
              <p className="text-sm sm:text-2xl font-black text-purple-600 transition-colors duration-200">
                {filteredTransactions.length}
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Controls */}
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
                      placeholder="Buscar transacciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600 text-sm sm:text-base"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 text-sm sm:text-base">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-40 h-10 sm:h-12 text-sm sm:text-base">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wide">
                Lista de Transacciones ({filteredTransactions.length})
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
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {orderedTransactions.length === 0
                    ? "No tienes transacciones aún"
                    : "No se encontraron transacciones con los filtros aplicados"
                  }
                </p>
                {orderedTransactions.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    Crea tu primera transacción o usa la página &quot;Datos Ejemplo&quot; para generar transacciones de prueba
                  </p>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTransactions.map(t => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction, index) => (
                      <SortableTransaction
                        key={transaction._id}
                        transaction={transaction}
                        index={index}
                        hoveredTransaction={hoveredTransaction}
                        setHoveredTransaction={setHoveredTransaction}
                        setSelectedTransaction={setSelectedTransaction}
                        setIsEditModalOpen={setIsEditModalOpen}
                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                        userCurrency={userCurrency}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTransactions.map((transaction) => (
                  <GridTransaction
                    key={transaction._id}
                    transaction={transaction}
                    hoveredTransaction={hoveredTransaction}
                    setHoveredTransaction={setHoveredTransaction}
                    setSelectedTransaction={setSelectedTransaction}
                    setIsEditModalOpen={setIsEditModalOpen}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                    userCurrency={userCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
      />

      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />

      {selectedTransaction && (
        <DeleteTransactionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
        />
      )}

      {/* Subscription Popup for billing limits */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        limitType={currentLimitType}
        currentUsage={billingInfo?.usage.monthlyTransactions || 0}
        limit={billingInfo?.limits.monthlyTransactions || 10}
      />
    </div>
  );
}