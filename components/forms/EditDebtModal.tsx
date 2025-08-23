"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BrutalFormModal } from "@/components/ui/brutal-form-modal";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  Phone,
  Percent,
  CreditCard,
  Edit
} from "lucide-react";
import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";
import { usePriceInput, parseFormattedPrice } from "@/lib/price-formatter";
import { toast } from "sonner";

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

export interface EditDebtModalProps {
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

export default function EditDebtModal({
  isOpen,
  onClose,
  debt
}: EditDebtModalProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateDebt = useMutation(api.debts.updateDebt);

  // Price input handlers
  const originalAmountInput = usePriceInput("", "COP");
  const currentAmountInput = usePriceInput("", "COP");
  const interestRateInput = usePriceInput("", "COP");

  const formatDueDate = (dueDate?: number): string => {
    if (typeof dueDate !== 'number') return "";
    return new Date(dueDate).toISOString().split('T')[0]!;
  };

  // Create initial form data dynamically based on debt prop
  const getInitialFormData = (): FormData => ({
    type: debt?.type || "i_owe",
    originalAmount: debt?.originalAmount?.toString() || "",
    currentAmount: debt?.currentAmount?.toString() || "",
    description: debt?.description || "",
    counterpartyName: debt?.counterpartyName || "",
    counterpartyContact: debt?.counterpartyContact || "",
    dueDate: formatDueDate(debt?.dueDate),
    notes: debt?.notes || "",
    interestRate: debt?.interestRate?.toString() || "",
    status: debt?.status || "open"
  });

  const validationRules = useMemo(() => createValidationRules<FormData>([
    {
      field: 'originalAmount',
      validators: [
        (value) => {
          if (!value || value.trim() === "") {
            return 'El monto original es requerido';
          }
          const numValue = parseFormattedPrice(value, "COP");
          if (numValue <= 0) {
            return 'El monto original debe ser mayor a 0';
          }
          return null;
        }
      ],
    },
    {
      field: 'currentAmount',
      validators: [
        (value, formData) => {
          if (!value || value.trim() === "") {
            return 'El monto actual es requerido';
          }
          const currentValue = parseFormattedPrice(value, "COP");
          if (currentValue < 0) {
            return 'El monto actual no puede ser negativo';
          }
          // Only validate against original amount if it exists
          if (formData?.originalAmount) {
            const originalValue = parseFormattedPrice(formData.originalAmount, "COP");
            if (currentValue > originalValue) {
              return 'El monto actual no puede ser mayor al original';
            }
          }
          return null;
        }
      ],
    },
    {
      field: 'description',
      validators: [commonValidationRules.required('Descripción')],
    },
    {
      field: 'counterpartyName',
      validators: [commonValidationRules.required('Nombre de la contraparte')],
    },
    {
      field: 'interestRate',
      validators: [
        (value) => {
          if (value && value.trim()) {
            const numValue = parseFormattedPrice(value, "COP");
            if (numValue < 0) {
              return 'La tasa de interés no puede ser negativa';
            }
            if (numValue > 100) {
              return 'La tasa de interés no puede ser mayor al 100%';
            }
          }
          return null;
        }
      ],
    },
  ]), []);

  const submitDebt = async (data: FormData) => {
    if (!currentUser || !debt) {
      toast.error("Error: Usuario o deuda no encontrados");
      return;
    }

    try {
      const updateData: {
        id: Id<"debts">;
        userId: Id<"users">;
        type: 'owes_me' | 'i_owe';
        originalAmount: number;
        currentAmount: number;
        description: string;
        counterpartyName: string;
        status: 'open' | 'paid' | 'overdue' | 'partially_paid';
        counterpartyContact?: string;
        dueDate?: number;
        notes?: string;
        interestRate?: number;
      } = {
        id: debt._id as Id<"debts">,
        userId: currentUser._id,
        type: data.type,
        originalAmount: originalAmountInput.rawValue,
        currentAmount: currentAmountInput.rawValue,
        description: data.description.trim(),
        counterpartyName: data.counterpartyName.trim(),
        status: data.status,
      };

      // Add optional fields only if they have values
      if (data.counterpartyContact?.trim()) {
        updateData.counterpartyContact = data.counterpartyContact.trim();
      }
      
      if (data.dueDate) {
        updateData.dueDate = new Date(data.dueDate).getTime();
      }
      
      if (data.notes?.trim()) {
        updateData.notes = data.notes.trim();
      }
      
      if (interestRateInput.rawValue > 0) {
        updateData.interestRate = interestRateInput.rawValue;
      }

      await updateDebt(updateData);

      toast.success("Deuda actualizada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating debt:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al actualizar la deuda: ${errorMessage}`);
    }
  };

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    resetForm,
  } = useFormHandler({
    initialData: getInitialFormData(),
    validationRules,
  });

  const handleClose = () => {
    // Reset form to empty state
    resetForm();
    originalAmountInput.setValue(0);
    currentAmountInput.setValue(0);
    interestRateInput.setValue(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen && debt) {
      // Reset form with debt data
      const initialData = getInitialFormData();
      resetForm();
      
      // Update each field with debt data
      Object.entries(initialData).forEach(([key, value]) => {
        updateField(key as keyof FormData, value);
      });
      
      // Set price input values
      originalAmountInput.setValue(debt.originalAmount || 0);
      currentAmountInput.setValue(debt.currentAmount || 0);
      interestRateInput.setValue(debt.interestRate || 0);
    } else if (!isOpen) {
      // Reset everything when modal closes
      resetForm();
      originalAmountInput.setValue(0);
      currentAmountInput.setValue(0);
      interestRateInput.setValue(0);
    }
  }, [isOpen, debt]);

  const debtTypeOptions = [
    { value: "i_owe", label: "YO DEBO" },
    { value: "owes_me", label: "ME DEBEN" }
  ];

  const statusOptions = [
    { value: "open", label: "ABIERTA" },
    { value: "partially_paid", label: "PARCIALMENTE PAGADA" },
    { value: "paid", label: "PAGADA" },
    { value: "overdue", label: "VENCIDA" }
  ];

  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={() => handleSubmit(submitDebt)}
      title="EDITAR DEUDA"
      subtitle="Modifica los datos de la deuda"
      icon={<Edit className="w-6 h-6" />}
      submitText="ACTUALIZAR DEUDA"
      cancelText="CANCELAR"
      isLoading={isSubmitting}
      variant="edit"
      size="xl"
    >
      {/* Formulario en estilo tabla */}
      <div className="space-y-6">
        {/* Información básica */}
        <div className="brutal-card border-4 border-black bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black">
            <h3 className="font-black uppercase tracking-wider text-lg flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              INFORMACIÓN BÁSICA
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrutalSelect
                label="TIPO DE DEUDA"
                icon={<FileText className="w-4 h-4" />}
                placeholder="Selecciona el tipo"
                value={formData.type}
                onChange={(value) => updateField("type", value)}
                options={debtTypeOptions}
              />
              <BrutalSelect
                label="ESTADO"
                icon={<FileText className="w-4 h-4" />}
                placeholder="Selecciona el estado"
                value={formData.status}
                onChange={(value) => updateField("status", value)}
                options={statusOptions}
              />
            </div>
            <BrutalInput
              label="DESCRIPCIÓN"
              icon={<FileText className="w-4 h-4" />}
              placeholder="Describe la deuda..."
              value={formData.description}
              onChange={(value) => updateField("description", value)}
              error={errors.description}
              required
            />
          </div>
        </div>

        {/* Montos */}
        <div className="brutal-card border-4 border-black bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black">
            <h3 className="font-black uppercase tracking-wider text-lg flex items-center gap-3">
              <DollarSign className="w-5 h-5" />
              MONTOS
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrutalInput
                label="MONTO ORIGINAL"
                icon={<DollarSign className="w-4 h-4" />}
                type="text"
                placeholder="$0"
                value={originalAmountInput.displayValue}
                onChange={(value) => {
                  originalAmountInput.handleChange(value);
                  updateField("originalAmount", value);
                }}
                error={errors.originalAmount}
                required
              />
              <BrutalInput
                label="MONTO ACTUAL"
                icon={<DollarSign className="w-4 h-4" />}
                type="text"
                placeholder="$0"
                value={currentAmountInput.displayValue}
                onChange={(value) => {
                  currentAmountInput.handleChange(value);
                  updateField("currentAmount", value);
                }}
                error={errors.currentAmount}
                required
              />
            </div>
          </div>
        </div>

        {/* Información de la contraparte */}
        <div className="brutal-card border-4 border-black bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black">
            <h3 className="font-black uppercase tracking-wider text-lg flex items-center gap-3">
              <User className="w-5 h-5" />
              CONTRAPARTE
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrutalInput
                label="NOMBRE"
                icon={<User className="w-4 h-4" />}
                placeholder="Nombre de la persona"
                value={formData.counterpartyName}
                onChange={(value) => updateField("counterpartyName", value)}
                error={errors.counterpartyName}
                required
              />
              <BrutalInput
                label="CONTACTO"
                icon={<Phone className="w-4 h-4" />}
                placeholder="Teléfono o email"
                value={formData.counterpartyContact}
                onChange={(value) => updateField("counterpartyContact", value)}
              />
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="brutal-card border-4 border-black bg-white">
          <div className="bg-black text-white p-4 border-b-4 border-black">
            <h3 className="font-black uppercase tracking-wider text-lg flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              DETALLES
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BrutalInput
                label="FECHA DE VENCIMIENTO"
                icon={<Calendar className="w-4 h-4" />}
                type="date"
                value={formData.dueDate}
                onChange={(value) => updateField("dueDate", value)}
              />
              <BrutalInput
                label="TASA DE INTERÉS (%)"
                icon={<Percent className="w-4 h-4" />}
                type="text"
                placeholder="0%"
                value={interestRateInput.displayValue}
                onChange={(value) => {
                  interestRateInput.handleChange(value);
                  updateField("interestRate", value);
                }}
                error={errors.interestRate}
              />
            </div>
            <BrutalTextarea
              label="NOTAS ADICIONALES"
              icon={<FileText className="w-4 h-4" />}
              placeholder="Información adicional sobre la deuda..."
              value={formData.notes}
              onChange={(value) => updateField("notes", value)}
              rows={4}
            />
          </div>
        </div>
      </div>
    </BrutalFormModal>
  );
}