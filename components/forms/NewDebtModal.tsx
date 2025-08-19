"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  PhoneIcon,
  PlusIcon,
  MinusIcon,
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
      await createDebt({
        userId: currentUser._id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        counterpartyName: formData.counterpartyName.trim(),
        counterpartyContact: formData.counterpartyContact.trim() || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
        notes: formData.notes.trim() || undefined,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      });
      toast.success("Deuda creada exitosamente.");
      handleClose();
    } catch (error) {
      console.error("Error creating debt:", error);
      toast.error("Error al crear la deuda. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
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
  };

  const buttonClass = (type: "owes_me" | "i_owe") => `
    flex items-center justify-center gap-2 border-4 border-black font-black uppercase tracking-wide transition-all duration-200 px-6 py-3
    ${formData.type === type
      ? type === "owes_me"
        ? "bg-green-400 text-black"
        : "bg-red-400 text-black"
      : "bg-white hover:bg-black hover:text-white"
    }
  `;

  const inputClass = (isError: boolean) => `
    border-4 font-bold text-black w-full px-4 py-3 bg-white
    ${isError ? "border-red-500" : "border-black"}
    focus:outline-none focus:ring-0
  `;

  const FormInput = ({ label, id, icon: Icon, type, placeholder, value, onChange, error, ...props }: any) => (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-lg font-black text-black uppercase tracking-wide flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {label} {props.required && "*"}
      </Label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClass(!!error)}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm font-bold">{error}</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="new-debt-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <motion.div
            className="relative bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-yellow-400 border-b-4 border-black px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-black p-3 border-4 border-black">
                  <CurrencyDollarIcon className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-wider">
                    Nueva Deuda
                  </h2>
                  <p className="text-black font-bold text-sm hidden sm:block">
                    Registra una nueva deuda o préstamo
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-black text-yellow-400 p-3 border-4 border-black hover:bg-yellow-400 hover:text-black transition-all duration-200 font-black"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Debt Type */}
                <div className="space-y-4">
                  <Label className="text-lg font-black text-black uppercase tracking-wide">
                    Tipo de Deuda
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange("type", "owes_me")}
                      className={buttonClass("owes_me")}
                    >
                      <PlusIcon className="w-5 h-5" />
                      Me Deben
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("type", "i_owe")}
                      className={buttonClass("i_owe")}
                    >
                      <MinusIcon className="w-5 h-5" />
                      Debo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormInput
                    id="amount"
                    label="Monto"
                    icon={CurrencyDollarIcon}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e: any) => handleInputChange("amount", e.target.value)}
                    error={errors.amount}
                    required
                  />
                  <FormInput
                    id="description"
                    label="Descripción"
                    icon={DocumentTextIcon}
                    type="text"
                    placeholder="Descripción de la deuda"
                    value={formData.description}
                    onChange={(e: any) => handleInputChange("description", e.target.value)}
                    error={errors.description}
                    required
                  />
                  <FormInput
                    id="counterpartyName"
                    label="Persona"
                    icon={UserIcon}
                    type="text"
                    placeholder="Nombre de la persona"
                    value={formData.counterpartyName}
                    onChange={(e: any) => handleInputChange("counterpartyName", e.target.value)}
                    error={errors.counterpartyName}
                    required
                  />
                  <FormInput
                    id="counterpartyContact"
                    label="Contacto"
                    icon={PhoneIcon}
                    type="text"
                    placeholder="Teléfono o email (opcional)"
                    value={formData.counterpartyContact}
                    onChange={(e: any) => handleInputChange("counterpartyContact", e.target.value)}
                  />
                  <FormInput
                    id="dueDate"
                    label="Fecha de Vencimiento"
                    icon={CalendarIcon}
                    type="date"
                    value={formData.dueDate}
                    onChange={(e: any) => handleInputChange("dueDate", e.target.value)}
                    error={errors.dueDate}
                  />
                  <FormInput
                    id="interestRate"
                    label="Tasa de Interés (%)"
                    icon={CurrencyDollarIcon} // Puedes usar un icono diferente si lo tienes
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={formData.interestRate}
                    onChange={(e: any) => handleInputChange("interestRate", e.target.value)}
                    error={errors.interestRate}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-lg font-black text-black uppercase tracking-wide flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Notas
                  </Label>
                  <textarea
                    id="notes"
                    placeholder="Notas adicionales (opcional)"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="border-4 font-bold text-black w-full px-4 py-3 bg-white border-black focus:outline-none focus:ring-0 min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-white hover:bg-black hover:text-white text-black font-black uppercase tracking-wide border-4 border-black px-6 py-3 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 font-black uppercase tracking-wide border-4 border-black px-6 py-3 transition-all duration-200 ${formData.type === "owes_me"
                        ? "bg-green-400 hover:bg-green-500 text-black"
                        : "bg-red-400 hover:bg-red-500 text-black"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Creando...
                      </div>
                    ) : (
                      'Crear Deuda'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}