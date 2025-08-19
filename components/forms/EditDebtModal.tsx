"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Edit,
  X,
  DollarSign,
  FileText,
  Calendar,
  User,
  Phone,
  Percent,
  Plus,
  Minus
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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

interface EditDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

interface FormData {
  type: 'owes_me' | 'i_owe';
  originalAmount: string;
  currentAmount: string;
  description: string;
  counterpartyName: string;
  counterpartyContact: string;
  dueDate: string;
  notes: string;
  interestRate: string;
  status: 'open' | 'paid' | 'overdue' | 'partially_paid';
}

interface FormErrors {
  originalAmount?: string;
  currentAmount?: string;
  description?: string;
  counterpartyName?: string;
  interestRate?: string;
}

export default function EditDebtModal({
  isOpen,
  onClose,
  debt
}: EditDebtModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateDebt = useMutation(api.debts.updateDebt);

  const [formData, setFormData] = useState<FormData>({
    type: "i_owe",
    originalAmount: "",
    currentAmount: "",
    description: "",
    counterpartyName: "",
    counterpartyContact: "",
    dueDate: "",
    notes: "",
    interestRate: "",
    status: "open"
  });

  // Load debt data when modal opens
  useEffect(() => {
    if (debt && isOpen) {
      setFormData({
        type: debt.type,
        originalAmount: debt.originalAmount.toString(),
        currentAmount: debt.currentAmount.toString(),
        description: debt.description,
        counterpartyName: debt.counterpartyName,
        counterpartyContact: debt.counterpartyContact || "",
        dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : "",
        notes: debt.notes || "",
        interestRate: debt.interestRate?.toString() || "",
        status: debt.status
      });
    }
  }, [debt, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.originalAmount || parseFloat(formData.originalAmount) <= 0) {
      newErrors.originalAmount = "El monto original debe ser mayor a 0";
    }

    if (!formData.currentAmount || parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = "El monto actual no puede ser negativo";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.counterpartyName.trim()) {
      newErrors.counterpartyName = "El nombre de la persona es requerido";
    }

    if (formData.interestRate && (parseFloat(formData.interestRate) < 0 || parseFloat(formData.interestRate) > 100)) {
      newErrors.interestRate = "La tasa de interés debe estar entre 0 y 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentUser || !debt) return;

    setIsSubmitting(true);

    try {
      await updateDebt({
        id: debt._id as Id<"debts">,
        userId: currentUser._id,
        type: formData.type,
        originalAmount: parseFloat(formData.originalAmount),
        currentAmount: parseFloat(formData.currentAmount),
        description: formData.description.trim(),
        counterpartyName: formData.counterpartyName.trim(),
        counterpartyContact: formData.counterpartyContact.trim() || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
        notes: formData.notes.trim() || undefined,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
        status: formData.status,
      });

      onClose();
    } catch (error) {
      console.error("Error updating debt:", error);
      // You can add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const buttonClass = (type: "owes_me" | "i_owe") => `
    brutal-button h-12 font-black uppercase tracking-wide transition-all duration-200
    ${formData.type === type
      ? type === "owes_me"
        ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
        : "bg-red-500 hover:bg-red-600 text-white border-red-500"
      : "border-black hover:bg-black hover:text-white"
    }
  `;

  const inputClass = (isError: boolean) => `
    brutal-input h-12 font-medium border-black w-full px-4 py-3
    ${isError ? "border-red-500" : "border-black"}
  `;



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="brutal-card p-0 border-4 border-black shadow-brutal max-w-3xl w-full sm:max-w-2xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Editar Deuda</DialogTitle>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="edit-debt-modal"
              className="bg-white w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <motion.div 
                className="relative px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    >
                      <Edit className="w-6 h-6" />
                    </motion.div>
                    <div>
                      <motion.h2 
                        className="text-2xl font-bold"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        Editar Deuda
                      </motion.h2>
                      <motion.p 
                        className="text-blue-100 text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        Modifica los detalles de tu deuda
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Decorative line */}
              <motion.div
                className="w-full h-1 bg-black"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Content */}
              <div className="p-6 bg-white max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Debt Type */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Tipo de Deuda
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        onClick={() => handleInputChange("type", "owes_me")}
                        className={`h-14 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 ${
                          formData.type === "owes_me"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="w-5 h-5" />
                        Me Deben
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => handleInputChange("type", "i_owe")}
                        className={`h-14 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 ${
                          formData.type === "i_owe"
                            ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Minus className="w-5 h-5" />
                        Debo
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Amounts */}
                  <motion.div 
                    className="grid grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Monto Original *
                        </label>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.originalAmount}
                        onChange={(e) => handleInputChange("originalAmount", e.target.value)}
                        className={`h-12 text-lg border-2 rounded-xl transition-all duration-200 ${
                          errors.originalAmount 
                            ? "border-red-400 bg-red-50 focus:border-red-500" 
                            : "border-gray-300 focus:border-blue-500 focus:bg-blue-50"
                        }`}
                      />
                      {errors.originalAmount && (
                        <motion.p 
                          className="text-red-500 text-sm font-medium flex items-center gap-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.originalAmount}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Monto Actual *
                        </label>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.currentAmount}
                        onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                        className={`h-12 text-lg border-2 rounded-xl transition-all duration-200 ${
                          errors.currentAmount 
                            ? "border-red-400 bg-red-50 focus:border-red-500" 
                            : "border-gray-300 focus:border-blue-500 focus:bg-blue-50"
                        }`}
                      />
                      {errors.currentAmount && (
                        <motion.p 
                          className="text-red-500 text-sm font-medium flex items-center gap-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.currentAmount}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  {/* Status */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Estado
                      </label>
                    </div>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="h-12 text-lg border-2 rounded-xl border-gray-300 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Abierta</SelectItem>
                        <SelectItem value="partially_paid">Parcialmente Pagada</SelectItem>
                        <SelectItem value="paid">Pagada</SelectItem>
                        <SelectItem value="overdue">Vencida</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Description */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Descripción *
                      </label>
                    </div>
                    <Input
                      type="text"
                      placeholder="Descripción de la deuda"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`h-12 text-lg border-2 rounded-xl transition-all duration-200 ${
                        errors.description 
                          ? "border-red-400 bg-red-50 focus:border-red-500" 
                          : "border-gray-300 focus:border-blue-500 focus:bg-blue-50"
                      }`}
                    />
                    {errors.description && (
                      <motion.p 
                        className="text-red-500 text-sm font-medium flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.description}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Counterparty Name */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Persona *
                      </label>
                    </div>
                    <Input
                      type="text"
                      placeholder="Nombre de la persona"
                      value={formData.counterpartyName}
                      onChange={(e) => handleInputChange("counterpartyName", e.target.value)}
                      className={`h-12 text-lg border-2 rounded-xl transition-all duration-200 ${
                        errors.counterpartyName 
                          ? "border-red-400 bg-red-50 focus:border-red-500" 
                          : "border-gray-300 focus:border-blue-500 focus:bg-blue-50"
                      }`}
                    />
                    {errors.counterpartyName && (
                      <motion.p 
                        className="text-red-500 text-sm font-medium flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.counterpartyName}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Counterparty Contact */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Contacto
                      </label>
                    </div>
                    <Input
                      type="text"
                      placeholder="Teléfono o email (opcional)"
                      value={formData.counterpartyContact}
                      onChange={(e) => handleInputChange("counterpartyContact", e.target.value)}
                      className="h-12 text-lg border-2 rounded-xl border-gray-300 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200"
                    />
                  </motion.div>

                  {/* Due Date */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-pink-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Fecha de Vencimiento
                      </label>
                    </div>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className="h-12 text-lg border-2 rounded-xl border-gray-300 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200"
                    />
                  </motion.div>

                  {/* Interest Rate */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Percent className="w-5 h-5 text-yellow-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Tasa de Interés (%)
                      </label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange("interestRate", e.target.value)}
                      className={`h-12 text-lg border-2 rounded-xl transition-all duration-200 ${
                        errors.interestRate 
                          ? 'border-red-400 bg-red-50 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500 focus:bg-blue-50'
                      }`}
                    />
                    {errors.interestRate && (
                      <motion.p 
                        className="text-red-500 text-sm font-medium"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.interestRate}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Notes */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Notas
                      </label>
                    </div>
                    <Textarea
                      placeholder="Notas adicionales (opcional)"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="min-h-[80px] text-lg border-2 rounded-xl border-gray-300 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex gap-4 pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 h-14 text-lg font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 rounded-xl flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Edit className="w-5 h-5" />
                          Actualizar Deuda
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}