"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  BellIcon, 
  XMarkIcon, 
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



  // Clases CSS para el estilo brutalista
  const inputClass = "w-full px-4 py-3 text-lg font-bold border-4 border-black bg-white focus:bg-yellow-100 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform focus:scale-105";
  const textareaClass = "w-full px-4 py-3 text-lg font-bold border-4 border-black bg-white focus:bg-yellow-100 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform focus:scale-105 resize-none";
  const selectClass = "w-full px-4 py-3 text-lg font-bold border-4 border-black bg-white focus:bg-yellow-100 focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform focus:scale-105";

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
          {/* Header */}
          <div className="bg-red-400 border-b-8 border-black p-6 relative">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-4 text-3xl font-black text-black uppercase tracking-wider">
                <div className="p-3 bg-black border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <BellIcon className="h-8 w-8 text-white" />
                </div>
                EDITAR RECORDATORIO
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-black border-4 border-white hover:bg-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Título */}
              <div>
                <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                  <DocumentTextIcon className="h-6 w-6 text-black" />
                  TÍTULO *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="EJ: PAGAR FACTURA DE ELECTRICIDAD"
                  className={inputClass}
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                  <DocumentTextIcon className="h-6 w-6 text-black" />
                  DESCRIPCIÓN
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="DETALLES ADICIONALES DEL RECORDATORIO..."
                  className={textareaClass}
                  rows={3}
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                    <CalendarIcon className="h-6 w-6 text-black" />
                    FECHA DE VENCIMIENTO *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                    <ClockIcon className="h-6 w-6 text-black" />
                    HORA
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Prioridad, Categoría y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                    <ExclamationTriangleIcon className="h-6 w-6 text-black" />
                    PRIORIDAD *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                    className={selectClass}
                    required
                  >
                    <option value="">SELECCIONAR PRIORIDAD</option>
                    <option value="low">🟢 BAJA</option>
                    <option value="medium">🟡 MEDIA</option>
                    <option value="high">🔴 ALTA</option>
                    <option value="urgent">🚨 URGENTE</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                    <TagIcon className="h-6 w-6 text-black" />
                    CATEGORÍA *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "debt" | "payment" | "meeting" | "task" | "other")}
                    className={selectClass}
                    required
                  >
                    <option value="">SELECCIONAR CATEGORÍA</option>
                    <option value="debt">💰 DEUDA</option>
                    <option value="payment">💳 PAGO</option>
                    <option value="meeting">👥 REUNIÓN</option>
                    <option value="task">📋 TAREA</option>
                    <option value="other">📝 OTRO</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                    <CheckCircleIcon className="h-6 w-6 text-black" />
                    ESTADO *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "pending" | "completed" | "cancelled")}
                    className={selectClass}
                    required
                  >
                    <option value="">SELECCIONAR ESTADO</option>
                    <option value="pending">⏳ PENDIENTE</option>
                    <option value="completed">✅ COMPLETADO</option>
                    <option value="cancelled">❌ CANCELADO</option>
                  </select>
                </div>
              </div>

              {/* Relaciones */}
              {(category === "debt" || category === "payment") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                      <CreditCardIcon className="h-6 w-6 text-black" />
                      DEUDA RELACIONADA
                    </label>
                    <select
                      value={relatedDebtId || ""}
                      onChange={(e) => setRelatedDebtId(e.target.value || "")}
                      className={selectClass}
                    >
                      <option value="">SIN DEUDA RELACIONADA</option>
                      {debts.map((debt: Debt) => (
                        <option key={debt._id} value={debt._id}>
                          {debt.description.toUpperCase()} - ${debt.currentAmount}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                      <UsersIcon className="h-6 w-6 text-black" />
                      CONTACTO RELACIONADO
                    </label>
                    <select
                      value={relatedContactId || ""}
                      onChange={(e) => setRelatedContactId(e.target.value || "")}
                      className={selectClass}
                    >
                      <option value="">SIN CONTACTO RELACIONADO</option>
                      {contacts.map((contact: Contact) => (
                        <option key={contact._id} value={contact._id}>
                          {contact.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Recurrencia */}
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-6 h-6 border-4 border-black bg-white checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="isRecurring" className="text-xl font-black text-black uppercase tracking-wide cursor-pointer">
                    <ArrowPathIcon className="h-6 w-6 text-black inline mr-3" />
                    RECORDATORIO RECURRENTE
                  </label>
                </div>
                {isRecurring && (
                  <div>
                    <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                      <ArrowPathIcon className="h-6 w-6 text-black" />
                      FRECUENCIA
                    </label>
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as "daily" | "weekly" | "monthly" | "yearly")}
                      className={selectClass}
                    >
                      <option value="">SELECCIONAR FRECUENCIA</option>
                      <option value="daily">📅 DIARIO</option>
                      <option value="weekly">📆 SEMANAL</option>
                      <option value="monthly">🗓️ MENSUAL</option>
                      <option value="yearly">📊 ANUAL</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-16 bg-gray-300 hover:bg-gray-400 text-black font-black text-lg uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <XMarkIcon className="h-6 w-6 mr-3" />
                  CANCELAR
                </button>
                {reminder.status === "pending" && (
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    className="flex-1 h-16 bg-green-500 hover:bg-green-600 text-white font-black text-lg uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <CheckCircleIcon className="h-6 w-6 mr-3" />
                    MARCAR COMPLETADO
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 h-16 bg-blue-500 hover:bg-blue-600 text-white font-black text-lg uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-white mr-3" />
                      GUARDANDO...
                    </div>
                  ) : (
                    <>
                      <BellIcon className="h-6 w-6 mr-3" />
                      GUARDAR CAMBIOS
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}