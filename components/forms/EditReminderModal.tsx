"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Bell } from "lucide-react";
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
      setDueDate(date.toISOString().split('T')[0]);
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
      
      await updateReminder({
        id: reminder._id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dateTime.getTime(),
        priority,
        status,
        category,
        relatedDebtId: relatedDebtId ? relatedDebtId as Id<"debts"> : undefined,
        relatedContactId: relatedContactId ? relatedContactId as Id<"contacts"> : undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
      });

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
      await updateReminder({
        id: reminder._id,
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate,
        priority: reminder.priority,
        status: "completed",
        category: reminder.category,
        relatedDebtId: reminder.relatedDebtId,
        relatedContactId: reminder.relatedContactId,
        isRecurring: reminder.isRecurring,
        recurringFrequency: reminder.recurringFrequency,
      });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#f5f5dc] border-4 border-black shadow-[8px_8px_0px_0px_#000] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b-4 border-black pb-3 mb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-black text-white rounded-lg">
              <Bell className="h-4 w-4" />
            </div>
            Editar Recordatorio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Título *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Pagar factura de electricidad"
              className="brutal-input"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Descripción
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales del recordatorio..."
              className="brutal-input min-h-[80px] resize-none"
              rows={2}
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Fecha de Vencimiento *
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="brutal-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Hora
              </label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="brutal-input"
              />
            </div>
          </div>

          {/* Prioridad, Categoría y Estado */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Prioridad
              </label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high" | "urgent") => setPriority(value)}>
                <SelectTrigger className="brutal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="text-green-500">●</span>
                      Baja
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="text-yellow-500">●</span>
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="text-orange-500">●</span>
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">●</span>
                      Urgente
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Categoría
              </label>
              <Select value={category} onValueChange={(value: "debt" | "payment" | "meeting" | "task" | "other") => setCategory(value)}>
                <SelectTrigger className="brutal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt">
                    <span className="flex items-center gap-2">
                      💰 Deuda
                    </span>
                  </SelectItem>
                  <SelectItem value="payment">
                    <span className="flex items-center gap-2">
                      💳 Pago
                    </span>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <span className="flex items-center gap-2">
                      👥 Reunión
                    </span>
                  </SelectItem>
                  <SelectItem value="task">
                    <span className="flex items-center gap-2">
                      📋 Tarea
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="flex items-center gap-2">
                      📝 Otro
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Estado
              </label>
              <Select value={status} onValueChange={(value: "pending" | "completed" | "cancelled") => setStatus(value)}>
                <SelectTrigger className="brutal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="text-yellow-500">●</span>
                      Pendiente
                    </span>
                  </SelectItem>
                  <SelectItem value="completed">
                    <span className="flex items-center gap-2">
                      <span className="text-green-500">●</span>
                      Completado
                    </span>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <span className="flex items-center gap-2">
                      <span className="text-gray-500">●</span>
                      Cancelado
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Relaciones */}
          {(category === "debt" || category === "payment") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Deuda Relacionada
                </label>
                <Select value={relatedDebtId} onValueChange={setRelatedDebtId}>
                  <SelectTrigger className="brutal-input">
                    <SelectValue placeholder="Seleccionar deuda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      Ninguna
                    </SelectItem>
                    {debts.map((debt: Debt) => (
                      <SelectItem key={debt._id} value={debt._id}>
                        {debt.description} - ${debt.currentAmount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Contacto Relacionado
                </label>
                <Select value={relatedContactId} onValueChange={setRelatedContactId}>
                  <SelectTrigger className="brutal-input">
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      Ninguno
                    </SelectItem>
                    {contacts.map((contact: Contact) => (
                      <SelectItem key={contact._id} value={contact._id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Recurrencia */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                className="brutal-checkbox"
              />
              <label htmlFor="recurring" className="text-sm font-bold text-black">
                Recordatorio recurrente
              </label>
            </div>
            
            {isRecurring && (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Frecuencia
                </label>
                <Select value={recurringFrequency} onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setRecurringFrequency(value)}>
                  <SelectTrigger className="brutal-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-3 border-t-4 border-black">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 brutal-button"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            {reminder.status === "pending" && (
              <Button
                type="button"
                onClick={handleMarkCompleted}
                className="flex-1 brutal-button bg-green-600 text-white hover:bg-green-700"
                disabled={isLoading}
              >
                Marcar Completado
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 brutal-button bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}