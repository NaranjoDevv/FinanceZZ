"use client";

import { useState } from "react";
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
  ArrowPathIcon 
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

      if (!currentUser?._id) {
        toast.error("Usuario no autenticado");
        return;
      }

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




  const inputClass = "w-full px-4 py-3 text-lg font-bold border-4 border-black bg-white focus:bg-yellow-100 focus:outline-none focus:ring-0 transition-all duration-200";
  const selectClass = "w-full px-4 py-3 text-lg font-bold border-4 border-black bg-white focus:bg-yellow-100 focus:outline-none focus:ring-0 transition-all duration-200";

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header brutalista */}
          <div className="bg-yellow-400 border-b-8 border-black p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black border-4 border-black">
                  <BellIcon className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-black uppercase tracking-tight">CREAR RECORDATORIO</h2>
                  <p className="text-lg font-bold text-black">PROGRAMA UNA NUEVA TAREA</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-3 bg-red-500 border-4 border-black hover:bg-red-600 transition-colors transform hover:scale-110 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto bg-white">

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
                      placeholder="DESCRIBE EL RECORDATORIO..."
                      className={`${inputClass} min-h-[100px] resize-none`}
                      rows={3}
                    />
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                        <CalendarIcon className="h-6 w-6 text-black" />
                        FECHA *
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

                  {/* Prioridad y Categoría */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                        <TagIcon className="h-6 w-6 text-black" />
                        PRIORIDAD
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                        className={selectClass}
                      >
                        <option value="low">🟢 BAJA</option>
                        <option value="medium">🟡 MEDIA</option>
                        <option value="high">🟠 ALTA</option>
                        <option value="urgent">🔴 URGENTE</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                        <TagIcon className="h-6 w-6 text-black" />
                        CATEGORÍA
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as "debt" | "payment" | "meeting" | "task" | "other")}
                        className={selectClass}
                      >
                        <option value="debt">💰 DEUDA</option>
                        <option value="payment">💳 PAGO</option>
                        <option value="meeting">👥 REUNIÓN</option>
                        <option value="task">📋 TAREA</option>
                        <option value="other">📝 OTRO</option>
                      </select>
                    </div>
                  </div>

                  {/* Relaciones */}
                  {(category === "debt" || category === "payment") && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                            <CreditCardIcon className="h-6 w-6 text-black" />
                            DEUDA RELACIONADA
                          </label>
                          <select
                            value={relatedDebtId}
                            onChange={(e) => setRelatedDebtId(e.target.value)}
                            className={selectClass}
                          >
                            <option value="">NINGUNA</option>
                            {debts.map((debt: Debt) => (
                              <option key={debt._id} value={debt._id}>
                                {debt.description} - ${debt.currentAmount}
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
                            value={relatedContactId}
                            onChange={(e) => setRelatedContactId(e.target.value)}
                            className={selectClass}
                          >
                            <option value="">NINGUNO</option>
                            {contacts.map((contact: Contact) => (
                              <option key={contact._id} value={contact._id}>
                                {contact.name}
                              </option>
                            ))}
                          </select>
                        </div>
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
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 text-xl font-black text-black mb-4 uppercase tracking-wide">
                          <CalendarIcon className="h-6 w-6 text-black" />
                          FRECUENCIA
                        </label>
                        <select
                          value={recurringFrequency}
                          onChange={(e) => setRecurringFrequency(e.target.value as "daily" | "weekly" | "monthly" | "yearly")}
                          className={selectClass}
                        >
                          <option value="daily">📅 DIARIO</option>
                          <option value="weekly">📅 SEMANAL</option>
                          <option value="monthly">📅 MENSUAL</option>
                          <option value="yearly">📅 ANUAL</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-4 pt-8">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 font-black text-lg border-4 border-black bg-gray-200 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 font-black text-lg border-4 border-black bg-green-400 hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-3 border-black border-t-transparent animate-spin" />
                          CREANDO...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <BellIcon className="h-5 w-5" />
                          CREAR RECORDATORIO
                        </div>
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