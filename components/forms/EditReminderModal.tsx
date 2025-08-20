"use client";

import { useState, useEffect } from "react";
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
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
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

interface Reminder {
  _id: Id<"reminders">;
  title: string;
  description?: string;
  dueDate: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "cancelled";
  category: "debt" | "payment" | "meeting" | "task" | "other";
  relatedDebtId?: Id<"debts">;
  relatedContactId?: Id<"contacts">;
  isRecurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: number;
  updatedAt: number;
}

interface EditReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder;
}

export default function EditReminderModal({ isOpen, onClose, reminder }: EditReminderModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">("pending");
  const [category, setCategory] = useState<"debt" | "payment" | "meeting" | "task" | "other">("task");
  const [relatedDebtId, setRelatedDebtId] = useState("");
  const [relatedContactId, setRelatedContactId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [isLoading, setIsLoading] = useState(false);

  const updateReminder = useMutation(api.reminders.updateReminder);
  const currentUser = useQuery(api.users.getCurrentUser);
  const debts = useQuery(
    api.debts.getUserDebts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || [];
  const contacts = useQuery(
    api.contacts.getContacts,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || [];

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || "");
      
      // Convertir timestamp a fecha y hora
      const date = new Date(reminder.dueDate);
      setDueDate(date.toISOString().split('T')[0] || "");
      setDueTime(date.toTimeString().slice(0, 5));
      
      setPriority(reminder.priority);
      setStatus(reminder.status);
      setCategory(reminder.category);
      setRelatedDebtId(reminder.relatedDebtId || "");
      setRelatedContactId(reminder.relatedContactId || "");
      setIsRecurring(reminder.isRecurring);
      setRecurringFrequency(reminder.recurringFrequency || "weekly");
    }
  }, [reminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    if (!dueDate) {
      toast.error("La fecha de vencimiento es requerida");
      return;
    }

    setIsLoading(true);

    try {
      // Combinar fecha y hora
      const dateTime = new Date(`${dueDate}T${dueTime || '09:00'}`);
      
      const updateData: {
        id: Id<"reminders">;
        title: string;
        dueDate: number;
        priority: "low" | "medium" | "high" | "urgent";
        status: "pending" | "completed" | "cancelled";
        category: "debt" | "payment" | "meeting" | "task" | "other";
        isRecurring: boolean;
        description?: string;
        relatedDebtId?: Id<"debts">;
        relatedContactId?: Id<"contacts">;
        recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
      } = {
        id: reminder._id,
        title: title.trim(),
        dueDate: dateTime.getTime(),
        priority,
        status,
        category,
        isRecurring,
      };
      
      if (description.trim()) {
        updateData.description = description.trim();
      }
      
      if (relatedDebtId) {
        updateData.relatedDebtId = relatedDebtId as Id<"debts">;
      }
      
      if (relatedContactId) {
        updateData.relatedContactId = relatedContactId as Id<"contacts">;
      }
      
      if (isRecurring && recurringFrequency) {
        updateData.recurringFrequency = recurringFrequency;
      }
      
      await updateReminder(updateData);

      toast.success("Recordatorio actualizado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Error al actualizar el recordatorio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsLoading(true);
    try {
      const updateData: {
        id: Id<"reminders">;
        title: string;
        dueDate: number;
        priority: "low" | "medium" | "high" | "urgent";
        status: "pending" | "completed" | "cancelled";
        category: "debt" | "payment" | "meeting" | "task" | "other";
        isRecurring: boolean;
        description?: string;
        relatedDebtId?: Id<"debts">;
        relatedContactId?: Id<"contacts">;
        recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
      } = {
        id: reminder._id,
        title: reminder.title,
        dueDate: reminder.dueDate,
        priority: reminder.priority,
        status: "completed",
        category: reminder.category,
        isRecurring: reminder.isRecurring,
      };
      
      if (reminder.description) {
        updateData.description = reminder.description;
      }
      
      if (reminder.relatedDebtId) {
        updateData.relatedDebtId = reminder.relatedDebtId;
      }
      
      if (reminder.relatedContactId) {
        updateData.relatedContactId = reminder.relatedContactId;
      }
      
      if (reminder.recurringFrequency) {
        updateData.recurringFrequency = reminder.recurringFrequency;
      }
      
      await updateReminder(updateData);
      toast.success("Recordatorio marcado como completado");
      onClose();
    } catch (error) {
      console.error("Error completing reminder:", error);
      toast.error("Error al completar el recordatorio");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="EDITAR RECORDATORIO"
      subtitle="Modifica los detalles del recordatorio"
      variant="edit"
      icon={<BellIcon className="h-6 w-6" />}
      submitText="ACTUALIZAR RECORDATORIO"
      isLoading={isLoading}
      size="lg"
    >
        {/* Título */}
        <BrutalInput
          label="TÍTULO"
          icon={<DocumentTextIcon className="h-5 w-5" />}
          value={title}
          onChange={(value) => setTitle(value)}
          placeholder="EJ: PAGAR FACTURA DE ELECTRICIDAD"
          required
        />

        {/* Descripción */}
        <BrutalTextarea
          label="DESCRIPCIÓN"
          icon={<DocumentTextIcon className="h-5 w-5" />}
          value={description}
          onChange={(value) => setDescription(value)}
          placeholder="DETALLES ADICIONALES DEL RECORDATORIO..."
          rows={3}
        />

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BrutalInput
            label="FECHA DE VENCIMIENTO"
            icon={<CalendarIcon className="h-5 w-5" />}
            type="date"
            value={dueDate}
            onChange={(value) => setDueDate(value)}
            required
          />
          <BrutalInput
            label="HORA"
            icon={<ClockIcon className="h-5 w-5" />}
            type="time"
            value={dueTime}
            onChange={(value) => setDueTime(value)}
          />
        </div>

        {/* Prioridad, Categoría y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalSelect
            label="PRIORIDAD"
            icon={<ExclamationTriangleIcon className="h-5 w-5" />}
            placeholder="SELECCIONAR PRIORIDAD"
            value={priority}
            onChange={(value) => setPriority(value as "low" | "medium" | "high" | "urgent")}
            options={[
              { value: "low", label: "🟢 BAJA" },
              { value: "medium", label: "🟡 MEDIA" },
              { value: "high", label: "🔴 ALTA" },
              { value: "urgent", label: "🚨 URGENTE" }
            ]}
          />

          <BrutalSelect
            label="CATEGORÍA"
            icon={<TagIcon className="h-5 w-5" />}
            placeholder="SELECCIONAR CATEGORÍA"
            value={category}
            onChange={(value) => setCategory(value as "debt" | "payment" | "meeting" | "task" | "other")}
            options={[
              { value: "debt", label: "💰 DEUDA" },
              { value: "payment", label: "💳 PAGO" },
              { value: "meeting", label: "👥 REUNIÓN" },
              { value: "task", label: "📋 TAREA" },
              { value: "other", label: "📝 OTRO" }
            ]}
          />

          <BrutalSelect
            label="ESTADO"
            icon={<CheckCircleIcon className="h-5 w-5" />}
            placeholder="SELECCIONAR ESTADO"
            value={status}
            onChange={(value) => setStatus(value as "pending" | "completed" | "cancelled")}
            options={[
              { value: "pending", label: "⏳ PENDIENTE" },
              { value: "completed", label: "✅ COMPLETADO" },
              { value: "cancelled", label: "❌ CANCELADO" }
            ]}
          />
        </div>

        {/* Relaciones */}
        {(category === "debt" || category === "payment") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrutalSelect
              label="DEUDA RELACIONADA"
              icon={<CreditCardIcon className="h-5 w-5" />}
              placeholder="SIN DEUDA RELACIONADA"
              value={relatedDebtId || ""}
              onChange={(value) => setRelatedDebtId(value || "")}
              options={[
                { value: "", label: "SIN DEUDA RELACIONADA" },
                ...debts.map((debt: Debt) => ({
                  value: debt._id,
                  label: `${debt.description.toUpperCase()} - $${debt.currentAmount}`
                }))
              ]}
            />

            <BrutalSelect
              label="CONTACTO RELACIONADO"
              icon={<UsersIcon className="h-5 w-5" />}
              placeholder="SIN CONTACTO RELACIONADO"
              value={relatedContactId || ""}
              onChange={(value) => setRelatedContactId(value || "")}
              options={[
                { value: "", label: "SIN CONTACTO RELACIONADO" },
                ...contacts.map((contact: Contact) => ({
                  value: contact._id,
                  label: contact.name.toUpperCase()
                }))
              ]}
            />
          </div>
        )}

        {/* Recurrencia */}
        <div className="border-4 border-black bg-yellow-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-6 h-6 border-4 border-black bg-white checked:bg-black focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="isRecurring" className="text-xl font-black text-black uppercase tracking-wide">
              🔄 RECORDATORIO RECURRENTE
            </label>
          </div>

          {isRecurring && (
            <BrutalSelect
              label="FRECUENCIA"
              icon={<ArrowPathIcon className="h-5 w-5" />}
              value={recurringFrequency}
              placeholder="Seleccionar frecuencia"
              onChange={(value) => setRecurringFrequency(value as "daily" | "weekly" | "monthly" | "yearly")}
              options={[
                { value: "daily", label: "📅 DIARIO" },
                { value: "weekly", label: "📆 SEMANAL" },
                { value: "monthly", label: "🗓️ MENSUAL" },
                { value: "yearly", label: "📊 ANUAL" }
              ]}
            />
          )}
        </div>

        {/* Botón de acción rápida */}
        {reminder.status === "pending" && (
          <div className="border-4 border-black bg-green-100 p-6">
            <button
              type="button"
              onClick={handleMarkCompleted}
              className="w-full h-16 bg-green-500 hover:bg-green-600 text-white font-black text-lg uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 flex items-center justify-center"
              disabled={isLoading}
            >
              <CheckCircleIcon className="h-6 w-6 mr-3" />
              MARCAR COMO COMPLETADO
            </button>
          </div>
        )}
    </BrutalFormModal>
  );
}