"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon,
  PhoneIcon,
  PercentBadgeIcon
} from "@heroicons/react/24/outline";

export interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  type: "owes_me" | "i_owe";
  amount: string;
  description: string;
  counterpartyName: string;
  counterpartyContact: string;
  dueDate: string;
  notes: string;
  interestRate: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  counterpartyName?: string;
  dueDate?: string;
  interestRate?: string;
}

export default function NewDebtModal({
  isOpen,
  onClose,
}: NewDebtModalProps) {
  const [formData, setFormData] = useState<FormData>({
    type: "i_owe",
    amount: "",
    description: "",
    counterpartyName: "",
    counterpartyContact: "",
    dueDate: "",
    notes: "",
    interestRate: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);

  const createDebt = useMutation(api.debts.createDebt);

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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
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

    if (!validateForm() || !currentUser) return;

    setIsSubmitting(true);

    try {
      const debtData: {
        userId: Id<"users">;
        type: "owes_me" | "i_owe";
        amount: number;
        description: string;
        counterpartyName: string;
        counterpartyContact?: string;
        dueDate?: number;
        notes?: string;
        interestRate?: number;
      } = {
        userId: currentUser._id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        counterpartyName: formData.counterpartyName.trim()
      };
      
      if (formData.counterpartyContact.trim()) {
        debtData.counterpartyContact = formData.counterpartyContact.trim();
      }
      
      if (formData.dueDate) {
        debtData.dueDate = new Date(formData.dueDate).getTime();
      }
      
      if (formData.notes.trim()) {
        debtData.notes = formData.notes.trim();
      }
      
      if (formData.interestRate) {
        debtData.interestRate = parseFloat(formData.interestRate);
      }
      
      await createDebt(debtData);

      // Reset form
      setFormData({
        type: "i_owe",
        amount: "",
        description: "",
        counterpartyName: "",
        counterpartyContact: "",
        dueDate: "",
        notes: "",
        interestRate: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error creating debt:", error);
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
        className="brutal-card p-0 border-4 border-black shadow-brutal max-w-6xl w-[98vw] overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Nueva Deuda</DialogTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key="new-debt"
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-white">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-6 h-6" />
                <h2 className="text-xl font-black uppercase tracking-wider">
                  Nueva Deuda
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
            <motion.div
              className="p-6 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-3">
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

                {/* Primera fila de campos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      Monto *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className={inputClass(!!errors.amount)}
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <PencilSquareIcon className="w-4 h-4" />
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
                </div>

                {/* Segunda fila de campos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                </div>

                {/* Tercera fila de campos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Fecha de Vencimiento
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className={inputClass(!!errors.dueDate)}
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-sm font-medium">
                        {errors.dueDate}
                      </p>
                    )}
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
                </div>

                {/* Notes - Campo completo */}
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Notas
                  </label>
                  <textarea
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className={`${inputClass(false)} min-h-[50px] resize-none`}
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
                    {isSubmitting ? "Creando..." : "Crear Deuda"}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}