"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  BellIcon, 
  CalendarIcon, 
  ClockIcon, 
  TagIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";
import { BrutalFormModal } from "@/components/ui/brutal-form-modal";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";

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

interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateReminderModal({ isOpen, onClose }: CreateReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [category, setCategory] = useState<"debt" | "payment" | "meeting" | "task" | "other">("task");
  const [relatedDebtId, setRelatedDebtId] = useState("");
  const [relatedContactId, setRelatedContactId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);

  const createReminder = useMutation(api.reminders.createReminder);
  const debts = useQuery(
    api.debts.getUserDebts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || [];
  const contacts = useQuery(
    api.contacts.getContacts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || [];

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (!dueDate) {
      toast.error("La fecha de vencimiento es requerida");
      return;
    }

    if (!currentUser?._id) {
      toast.error("Usuario no autenticado");
      return;
    }

    setIsLoading(true);

    try {
      // Combinar fecha y hora
      const dateTime = new Date(`${dueDate}T${dueTime || '09:00'}`);

      const reminderData: {
        userId: Id<"users">;
        title: string;
        dueDate: number;
        priority: "low" | "medium" | "high" | "urgent";
        status: "pending";
        category: "debt" | "payment" | "meeting" | "task" | "other";
        isRecurring: boolean;
        description?: string;
        relatedDebtId?: Id<"debts">;
        relatedContactId?: Id<"contacts">;
        recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
      } = {
        userId: currentUser._id,
        title: title.trim(),
        dueDate: dateTime.getTime(),
        priority,
        status: "pending" as const,
        category,
        isRecurring,
      };

      if (description.trim()) {
        reminderData.description = description.trim();
      }
      if (relatedDebtId) {
        reminderData.relatedDebtId = relatedDebtId as Id<"debts">;
      }
      if (relatedContactId) {
        reminderData.relatedContactId = relatedContactId as Id<"contacts">;
      }

      if (isRecurring) {
        reminderData.recurringFrequency = recurringFrequency;
      }

      await createReminder(reminderData);

      toast.success("Recordatorio creado exitosamente");
      handleClose();
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast.error("Error al crear el recordatorio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setPriority("medium");
    setCategory("task");
    setRelatedDebtId("");
    setRelatedContactId("");
    setIsRecurring(false);
    setRecurringFrequency("weekly");
    onClose();
  };




  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Crear Recordatorio"
      subtitle="Programa una nueva tarea"
      submitText="Crear Recordatorio"
      cancelText="Cancelar"
      isLoading={isLoading}
      variant="create"
      icon={<BellIcon className="h-5 w-5" />}
      size="xl"
    >
      {/* Título */}
      <BrutalInput
        label="Título"
        value={title}
        onChange={(value) => setTitle(value)}
        placeholder="EJ: PAGAR FACTURA DE ELECTRICIDAD"
        required
        icon={<DocumentTextIcon className="h-5 w-5" />}
      />

      {/* Descripción */}
      <BrutalTextarea
        label="Descripción"
        value={description}
        onChange={(value) => setDescription(value)}
        placeholder="DESCRIBE EL RECORDATORIO..."
        rows={3}
        icon={<DocumentTextIcon className="h-5 w-5" />}
      />

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BrutalInput
          label="Fecha"
          type="date"
          value={dueDate}
          onChange={(value) => setDueDate(value)}
          required
          icon={<CalendarIcon className="h-5 w-5" />}
        />
        <BrutalInput
          label="Hora"
          type="time"
          value={dueTime}
          onChange={(value) => setDueTime(value)}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>

      {/* Prioridad y Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BrutalSelect
          label="Prioridad"
          value={priority}
          onChange={(value) => setPriority(value as "low" | "medium" | "high" | "urgent")}
          placeholder="SELECCIONA PRIORIDAD..."
          options={[
            { value: "low", label: "🟢 BAJA" },
            { value: "medium", label: "🟡 MEDIA" },
            { value: "high", label: "🟠 ALTA" },
            { value: "urgent", label: "🔴 URGENTE" }
          ]}
          icon={<TagIcon className="h-5 w-5" />}
        />
        <BrutalSelect
          label="Categoría"
          value={category}
          onChange={(value) => setCategory(value as "debt" | "payment" | "meeting" | "task" | "other")}
          placeholder="SELECCIONA CATEGORÍA..."
          options={[
            { value: "debt", label: "💰 DEUDA" },
            { value: "payment", label: "💳 PAGO" },
            { value: "meeting", label: "👥 REUNIÓN" },
            { value: "task", label: "📋 TAREA" },
            { value: "other", label: "📝 OTRO" }
          ]}
          icon={<TagIcon className="h-5 w-5" />}
        />
      </div>

      {/* Relaciones */}
      {(category === "debt" || category === "payment") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrutalSelect
              label="Deuda Relacionada"
              value={relatedDebtId}
              onChange={(value) => setRelatedDebtId(value)}
              placeholder="SELECCIONA DEUDA..."
              options={[
                { value: "", label: "NINGUNA" },
                ...debts.map((debt: Debt) => ({
                  value: debt._id,
                  label: `${debt.description} - $${debt.currentAmount}`
                }))
              ]}
              icon={<CreditCardIcon className="h-5 w-5" />}
            />
            <BrutalSelect
              label="Contacto Relacionado"
              value={relatedContactId}
              onChange={(value) => setRelatedContactId(value)}
              placeholder="SELECCIONA CONTACTO..."
              options={[
                { value: "", label: "NINGUNO" },
                ...contacts.map((contact: Contact) => ({
                  value: contact._id,
                  label: contact.name
                }))
              ]}
              icon={<UsersIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      )}

      {/* Recurrencia */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-6 h-6 border-4 border-black bg-white checked:bg-black focus:ring-0 focus:ring-offset-0"
          />
          <label htmlFor="recurring" className="flex items-center gap-3 text-xl font-black text-black uppercase tracking-wide">
            <ArrowPathIcon className="h-6 w-6 text-black" />
            RECORDATORIO RECURRENTE
          </label>
        </div>

        {isRecurring && (
          <BrutalSelect
            label="Frecuencia"
            value={recurringFrequency}
            onChange={(value) => setRecurringFrequency(value as "daily" | "weekly" | "monthly" | "yearly")}
            placeholder="SELECCIONA FRECUENCIA..."
            options={[
              { value: "daily", label: "📅 DIARIO" },
              { value: "weekly", label: "📅 SEMANAL" },
              { value: "monthly", label: "📅 MENSUAL" },
              { value: "yearly", label: "📅 ANUAL" }
            ]}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        )}
      </div>
    </BrutalFormModal>
  );
}