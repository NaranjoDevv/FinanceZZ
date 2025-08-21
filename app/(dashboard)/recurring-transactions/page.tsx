"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PlusIcon,
    ClockIcon,
    ArrowPathIcon,
    PauseIcon,
    PlayIcon,
    TrashIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import NewRecurringTransactionModal from "@/components/forms/NewRecurringTransactionModal";
import EditRecurringTransactionModal from "@/components/forms/EditRecurringTransactionModal";
import DeleteRecurringTransactionModal from "@/components/forms/DeleteRecurringTransactionModal";
import { RecurringTransaction as BaseRecurringTransaction } from "@/hooks/useRecurringTransactions";

interface RecurringTransaction extends BaseRecurringTransaction {
  categoryName?: string;
  subcategoryName?: string;
}

const FREQUENCY_LABELS = {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    yearly: "Anual",
};

const TYPE_LABELS = {
    income: "Ingreso",
    expense: "Gasto",
    debt_payment: "Pago de Deuda",
    loan_received: "Préstamo Recibido",
};

// Helper function to convert extended transaction to base transaction
const toBaseTransaction = (transaction: RecurringTransaction): BaseRecurringTransaction => {
    const { categoryName, subcategoryName, ...baseTransaction } = transaction;
    return baseTransaction;
};

export default function RecurringTransactionsPage() {
    const [showNewModal, setShowNewModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<RecurringTransaction | null>(null);
    const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

    const recurringTransactions = useQuery(api.recurringTransactions.getRecurringTransactions) as RecurringTransaction[] | undefined;

    const filteredTransactions = recurringTransactions?.filter((transaction) => {
        if (filter === "active" && !transaction.isActive) return false;
        if (filter === "paused" && transaction.isActive) return false;
        if (typeFilter === "income" && transaction.type !== "income") return false;
        if (typeFilter === "expense" && !(["expense", "debt_payment"].includes(transaction.type))) return false;
        return true;
    });

    const activeCount = recurringTransactions?.filter(t => t.isActive).length || 0;
    const pausedCount = recurringTransactions?.filter(t => !t.isActive).length || 0;
    const totalMonthlyAmount = recurringTransactions?.reduce((sum, t) => {
        if (!t.isActive) return sum;
        const multiplier = t.recurringFrequency === "daily" ? 30 :
            t.recurringFrequency === "weekly" ? 4.33 :
                t.recurringFrequency === "monthly" ? 1 : 0.083;
        return sum + (t.type === "income" ? t.amount : -t.amount) * multiplier;
    }, 0) || 0;

    if (recurringTransactions === undefined) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-black uppercase tracking-tight">
                        TRANSACCIONES RECURRENTES
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Automatiza tus ingresos y gastos regulares
                    </p>
                </div>
                <Button
                    onClick={() => setShowNewModal(true)}
                    className="bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all duration-200 font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    NUEVA RECURRENTE
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black uppercase text-gray-600">ACTIVAS</p>
                            <p className="text-2xl font-black text-green-600">{activeCount}</p>
                        </div>
                        <PlayIcon className="h-8 w-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black uppercase text-gray-600">PAUSADAS</p>
                            <p className="text-2xl font-black text-orange-600">{pausedCount}</p>
                        </div>
                        <PauseIcon className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>

                <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black uppercase text-gray-600">IMPACTO MENSUAL</p>
                            <p className={`text-2xl font-black ${totalMonthlyAmount >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatCurrency(Math.abs(totalMonthlyAmount))}
                            </p>
                        </div>
                        <ArrowPathIcon className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                    {["all", "active", "paused"].map((filterOption) => (
                        <Button
                            key={filterOption}
                            variant={filter === filterOption ? "default" : "outline"}
                            onClick={() => setFilter(filterOption as typeof filter)}
                            className="font-black uppercase tracking-wide border-2 border-black"
                        >
                            {filterOption === "all" ? "TODAS" :
                                filterOption === "active" ? "ACTIVAS" : "PAUSADAS"}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2">
                    {["all", "income", "expense"].map((typeOption) => (
                        <Button
                            key={typeOption}
                            variant={typeFilter === typeOption ? "default" : "outline"}
                            onClick={() => setTypeFilter(typeOption as typeof typeFilter)}
                            className="font-black uppercase tracking-wide border-2 border-black"
                        >
                            {typeOption === "all" ? "TODOS" :
                                typeOption === "income" ? "INGRESOS" : "GASTOS"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                {filteredTransactions?.length === 0 ? (
                    <Card className="p-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                        <ClockIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-black uppercase text-gray-600 mb-2">
                            NO HAY TRANSACCIONES RECURRENTES
                        </h3>
                        <p className="text-gray-500 font-medium">
                            Crea tu primera transacción recurrente para automatizar tus finanzas
                        </p>
                    </Card>
                ) : (
                    filteredTransactions?.map((transaction) => (
                        <motion.div
                            key={transaction._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group"
                        >
                            <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${transaction.type === "income" ? "bg-green-100 text-green-800" :
                                                "bg-red-100 text-red-800"
                                                }`}>
                                                {TYPE_LABELS[transaction.type]}
                                            </span>
                                            <span className="px-3 py-1 text-xs font-black uppercase border-2 border-black bg-blue-100 text-blue-800">
                                                {FREQUENCY_LABELS[transaction.recurringFrequency]}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${transaction.isActive ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                                                }`}>
                                                {transaction.isActive ? "ACTIVA" : "PAUSADA"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-black uppercase">
                                            {transaction.description}
                                        </h3>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="font-medium">
                                                Próxima ejecución: {transaction.nextExecutionDate ? new Date(transaction.nextExecutionDate).toLocaleDateString() : 'No programada'}
                                            </span>
                                            <span className="font-medium">
                                                Ejecutada {transaction.totalExecutions} veces
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className={`text-2xl font-black ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                                }`}>
                                                {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingTransaction(transaction)}
                                                className="border-2 border-black hover:bg-black hover:text-white font-black"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setDeletingTransaction(transaction)}
                                                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modals */}
            {showNewModal && (
                <NewRecurringTransactionModal
                    isOpen={showNewModal}
                    onClose={() => setShowNewModal(false)}
                />
            )}

            {editingTransaction && (
                <EditRecurringTransactionModal
                    isOpen={!!editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    transaction={toBaseTransaction(editingTransaction)}
                />
            )}

            {deletingTransaction && (
                <DeleteRecurringTransactionModal
                    isOpen={!!deletingTransaction}
                    onClose={() => setDeletingTransaction(null)}
                    transaction={deletingTransaction}
                />
            )}
        </div>
    );
}