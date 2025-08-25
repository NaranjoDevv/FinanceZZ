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
  CreditCard
} from "lucide-react";
import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";
import { useBilling } from "@/hooks/useBilling";
import { usePriceInput, parseFormattedPrice } from "@/lib/price-formatter";
import { toast } from "sonner";

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

export default function NewDebtModal({
  isOpen,
  onClose,
}: NewDebtModalProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const createDebt = useMutation(api.debts.createDebt);
  const { setShowSubscriptionPopup, setCurrentLimitType } = useBilling();

  // Price input handlers
  const amountInput = usePriceInput("", "COP");
  const interestRateInput = usePriceInput("", "COP");

  const initialFormData: FormData = {
    type: "i_owe",
    amount: "",
    description: "",
    counterpartyName: "",
    counterpartyContact: "",
    dueDate: "",
    notes: "",
    interestRate: "",
  };

  const validationRules = useMemo(() => createValidationRules<FormData>([
    {
      field: 'amount',
      validators: [
        (value) => {
          // Parse the formatted price value
          const numValue = parseFormattedPrice(value, "COP");
          if (numValue <= 0) {
            return 'El monto debe ser mayor a 0';
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
          if (value) {
            // Parse the formatted interest rate value
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
    if (!currentUser) {
      toast.error("Debes estar autenticado para crear una deuda");
      return;
    }

    try {
      const createData: {
        type: "owes_me" | "i_owe";
        amount: number;
        description: string;
        counterpartyName: string;
        userId: Id<"users">;
        counterpartyContact?: string;
        dueDate?: number;
        notes?: string;
        interestRate?: number;
      } = {
        type: data.type,
        amount: amountInput.rawValue,
        description: data.description,
        counterpartyName: data.counterpartyName,
        userId: currentUser._id as Id<"users">,
      };

      if (data.counterpartyContact) {
        createData.counterpartyContact = data.counterpartyContact;
      }
      if (data.dueDate) {
        createData.dueDate = new Date(data.dueDate).getTime();
      }
      if (data.notes) {
        createData.notes = data.notes;
      }
      if (data.interestRate) {
        createData.interestRate = interestRateInput.rawValue;
      }

      await createDebt(createData);

      toast.success("Deuda creada exitosamente");
      onClose();
    } catch (error: Error | unknown) {
      console.error("Error creating debt:", error);
      
      // Check if it's a billing limit error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("límite de") && errorMessage.includes("deudas")) {
        setCurrentLimitType("debts");
        setShowSubscriptionPopup(true);
        return;
      }
      
      toast.error(errorMessage);
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
    initialData: initialFormData,
    validationRules,
  });

  const handleClose = () => {
    resetForm();
    amountInput.setValue("");
    interestRateInput.setValue("");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      resetForm();
      amountInput.setValue("");
      interestRateInput.setValue("");
    }
  }, [isOpen]); // Only depend on isOpen to prevent infinite re-renders

  const debtTypeOptions = [
    { value: "i_owe", label: "YO DEBO" },
    { value: "owes_me", label: "ME DEBEN" }
  ];

  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={() => handleSubmit(submitDebt)}
      title="NUEVA DEUDA"
      subtitle="Registra una nueva deuda"
      icon={<DollarSign className="w-6 h-6" />}
      submitText="CREAR DEUDA"
      cancelText="CANCELAR"
      isLoading={isSubmitting}
      variant="create"
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
              <BrutalInput
                label="MONTO"
                icon={<DollarSign className="w-4 h-4" />}
                type="text"
                placeholder="$0"
                value={amountInput.displayValue}
                onChange={(value) => {
                  // Update price input and get the raw value synchronously
                  amountInput.handleChange(value);
                  // Update form with the input value for validation
                  updateField("amount", value);
                }}
                error={errors.amount}
                required
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
                  // Update price input and get the raw value synchronously
                  interestRateInput.handleChange(value);
                  // Update form with the input value for validation
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