"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    description: "Salario - Empresa XYZ",
    amount: 2500.00,
    type: "income",
    date: "2024-01-15",
    category: "Trabajo",
    status: "completed"
  },
  {
    id: 2,
    description: "Supermercado Central",
    amount: -85.50,
    type: "expense",
    date: "2024-01-14",
    category: "Alimentación",
    status: "completed"
  },
  {
    id: 3,
    description: "Pago de Renta",
    amount: -800.00,
    type: "expense",
    date: "2024-01-13",
    category: "Vivienda",
    status: "completed"
  },
  {
    id: 4,
    description: "Freelance - Proyecto Web",
    amount: 450.00,
    type: "income",
    date: "2024-01-12",
    category: "Freelance",
    status: "completed"
  },
  {
    id: 5,
    description: "Gasolina - Estación Shell",
    amount: -45.00,
    type: "expense",
    date: "2024-01-11",
    category: "Transporte",
    status: "pending"
  },
  {
    id: 6,
    description: "Venta de Producto",
    amount: 120.00,
    type: "income",
    date: "2024-01-10",
    category: "Ventas",
    status: "completed"
  },
  {
    id: 7,
    description: "Cena - Restaurante",
    amount: -65.00,
    type: "expense",
    date: "2024-01-09",
    category: "Entretenimiento",
    status: "completed"
  },
  {
    id: 8,
    description: "Pago de Servicios",
    amount: -150.00,
    type: "expense",
    date: "2024-01-08",
    category: "Servicios",
    status: "pending"
  }
];

const categories = ["Todos", "Trabajo", "Alimentación", "Vivienda", "Freelance", "Transporte", "Ventas", "Entretenimiento", "Servicios"];
const types = ["Todos", "Ingresos", "Gastos"];

export default function TransactionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesCategory = selectedCategory === "Todos" || transaction.category === selectedCategory;
    const matchesType = selectedType === "Todos" || 
      (selectedType === "Ingresos" && transaction.type === "income") ||
      (selectedType === "Gastos" && transaction.type === "expense");
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

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
          <Button className="brutal-button brutal-button--primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Transacción
          </Button>
          <Button className="brutal-button">
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </Button>
          <Button className="brutal-button">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Buscar
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
            <p className={`text-2xl font-black ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
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
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-black font-bold uppercase text-sm focus:outline-none focus:ring-0 focus:border-gray-600"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border-2 border-black font-bold uppercase text-sm focus:outline-none focus:ring-0 focus:border-gray-600"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                <p className="text-gray-500 font-medium text-lg">
                  No se encontraron transacciones
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-black transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-none ${
                        transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}>
                        {transaction.type === 'income' ? (
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
                          <span className={`px-2 py-1 text-xs font-bold uppercase ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}