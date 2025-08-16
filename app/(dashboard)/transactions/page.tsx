"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Bars3Icon
} from "@heroicons/react/24/outline";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import NewTransactionModal from "@/components/forms/NewTransactionModal";
import EditTransactionModal from "@/components/forms/EditTransactionModal";
import DeleteTransactionModal from "@/components/forms/DeleteTransactionModal";
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

// Componente para transacción arrastrable
function SortableTransaction({ transaction, index, hoveredTransaction, setHoveredTransaction, setSelectedTransaction, setIsEditModalOpen, setIsDeleteModalOpen }: {
  transaction: Transaction;
  index: number;
  hoveredTransaction: string | null;
  setHoveredTransaction: (id: string | null) => void;
  setSelectedTransaction: (transaction: Transaction) => void;
  setIsEditModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
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
      className={`relative flex items-center justify-between p-4 border-2 transition-all duration-200 group ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 rotate-2' 
          : 'border-gray-200 hover:border-black'
      }`}
      onMouseEnter={() => !isDragging && setHoveredTransaction(transaction._id)}
      onMouseLeave={() => setHoveredTransaction(null)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center justify-center w-8 h-8 mr-3 transition-colors rounded ${
          isDragging 
            ? 'cursor-grabbing text-blue-600 bg-blue-100' 
            : 'cursor-grab text-gray-400 hover:bg-gray-100'
        }`}
        title="Arrastrar para reordenar"
      >
        <Bars3Icon className="w-5 h-5" />
      </div>

      <div className="flex items-center space-x-4 flex-1">
        <div className={`p-3 rounded-none ${
          (transaction.type === 'income' || transaction.type === 'loan_received') ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {(transaction.type === 'income' || transaction.type === 'loan_received') ? (
            <ArrowUpIcon className="h-5 w-5" />
          ) : (
            <ArrowDownIcon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm uppercase tracking-wide">
              {transaction.description}
            </h4>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {transaction.category?.name || 'Sin categoría'} • {new Date(transaction.date).toLocaleDateString()}
          </p>
          {transaction.notes && (
            <p className="text-xs text-gray-500 mt-1">
              {transaction.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-lg font-black ${
            (transaction.type === 'income' || transaction.type === 'loan_received') ? 'text-green-600' : 'text-red-600'
          }`}>
            {(transaction.type === 'income' || transaction.type === 'loan_received') ? '+' : '-'}
            ${transaction.amount.toFixed(2)}
          </p>
        </div>

        {/* Action Buttons - Show on hover (hidden during drag) */}
        <div className={`flex gap-2 transition-all duration-200 ${
          hoveredTransaction === transaction._id && !isDragging
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}>
          <motion.button
            onClick={() => {
              setSelectedTransaction(transaction);
              setIsEditModalOpen(true);
            }}
            className="brutal-button p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Editar transacción"
          >
            <PencilIcon className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => {
              setSelectedTransaction(transaction);
              setIsDeleteModalOpen(true);
            }}
            className="brutal-button p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Eliminar transacción"
          >
            <TrashIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TransactionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [hoveredTransaction, setHoveredTransaction] = useState<string | null>(null);
  const [orderedTransactions, setOrderedTransactions] = useState<Transaction[]>([]);

  const { transactions, isLoading, error, currentUser, isAuthenticated } = useTransactions();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
    .filter(t => t.type === 'income' || t.type === 'loan_received')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' || t.type === 'debt_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Get unique categories from transactions
  const categories = ["Todos", ...Array.from(new Set(transactions.map(t => t.category?.name || "Sin categoría")))];

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
          Transacciones
        </h1>
        <p className="text-gray-600 font-medium">
          Gestiona y revisa todas tus transacciones
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
            onClick={() => setIsNewTransactionModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Transacción
          </Button>
          <Button className="brutal-button">
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
        className="mb-8"
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
                  <ArrowUpIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
                Total Ingresos
              </h3>
              <p className="text-2xl font-black text-green-600">${totalIncome.toFixed(2)}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500 text-white rounded-none">
                  <ArrowDownIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
                Total Gastos
              </h3>
              <p className="text-2xl font-black text-red-600">${totalExpenses.toFixed(2)}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 text-white rounded-none">
                  <CalendarIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
                Balance
              </h3>
              <p className={`text-2xl font-black ${balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                ${balance.toFixed(2)}
              </p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <Card className="brutal-card p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
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

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <h2 className="text-xl font-black uppercase tracking-wide">
              Lista de Transacciones ({filteredTransactions.length})
            </h2>
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
                    Crea tu primera transacción o usa la página "Datos Ejemplo" para generar transacciones de prueba
                  </p>
                )}
              </div>
            ) : (
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
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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

      <DeleteTransactionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}