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
import {
  PencilIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  PercentBadgeIcon,
  PlusIcon,
  MinusIcon
} from "@heroicons/react/24/outline";
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
              <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-white">
                <div className="flex items-center gap-3">
                  <PencilIcon className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    Editar Deuda
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="brutal-button p-2 hover:bg-black hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>

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
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Tipo de Deuda
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={formData.type === "owes_me" ? "default" : "outline"}
                        className={buttonClass("owes_me")}
                        onClick={() => handleInputChange("type", "owes_me")}
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Me Deben
                      </Button>
                      <Button
                        type="button"
                        variant={formData.type === "i_owe" ? "default" : "outline"}
                        className={buttonClass("i_owe")}
                        onClick={() => handleInputChange("type", "i_owe")}
                      >
                        <MinusIcon className="w-4 h-4 mr-2" />
                        Debo
                      </Button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Monto Original *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.originalAmount}
                        onChange={(e) => handleInputChange("originalAmount", e.target.value)}
                        className={inputClass(!!errors.originalAmount)}
                      />
                      {errors.originalAmount && (
                        <p className="text-red-500 text-sm font-medium">
                          {errors.originalAmount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Monto Actual *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.currentAmount}
                        onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                        className={inputClass(!!errors.currentAmount)}
                      />
                      {errors.currentAmount && (
                        <p className="text-red-500 text-sm font-medium">
                          {errors.currentAmount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Estado
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger className="brutal-input h-12 font-medium border-black w-full px-4 py-3">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Abierta</SelectItem>
                        <SelectItem value="partially_paid">Parcialmente Pagada</SelectItem>
                        <SelectItem value="paid">Pagada</SelectItem>
                        <SelectItem value="overdue">Vencida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Descripción *
                    </label>
                    <Input
                      type="text"
                      placeholder="Descripción de la deuda"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={inputClass(!!errors.description)}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Counterparty Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Persona *
                    </label>
                    <Input
                      type="text"
                      placeholder="Nombre de la persona"
                      value={formData.counterpartyName}
                      onChange={(e) => handleInputChange("counterpartyName", e.target.value)}
                      className={inputClass(!!errors.counterpartyName)}
                    />
                    {errors.counterpartyName && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.counterpartyName}
                      </p>
                    )}
                  </div>

                  {/* Counterparty Contact */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      Contacto
                    </label>
                    <Input
                      type="text"
                      placeholder="Teléfono o email (opcional)"
                      value={formData.counterpartyContact}
                      onChange={(e) => handleInputChange("counterpartyContact", e.target.value)}
                      className={inputClass(false)}
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Fecha de Vencimiento
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className={inputClass(false)}
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <PercentBadgeIcon className="w-4 h-4" />
                      Tasa de Interés (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange("interestRate", e.target.value)}
                      className={inputClass(!!errors.interestRate)}
                    />
                    {errors.interestRate && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.interestRate}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      Notas
                    </label>
                    <textarea
                      placeholder="Notas adicionales (opcional)"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className={`${inputClass(false)} min-h-[60px] resize-none`}
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <button
                      type="button"
                      onClick={onClose}
                      className="brutal-button flex-1 min-h-[48px] py-3 px-6 flex items-center justify-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="brutal-button brutal-button--primary flex-1 min-h-[48px] py-3 px-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Actualizando..." : "Actualizar Deuda"}
                    </button>
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