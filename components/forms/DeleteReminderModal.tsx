"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Clock } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

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

interface DeleteReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder;
}

export default function DeleteReminderModal({ isOpen, onClose, reminder }: DeleteReminderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const deleteReminder = useMutation(api.reminders.deleteReminder);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteReminder({ id: reminder._id });
      toast.success("Recordatorio eliminado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Error al eliminar el recordatorio");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-600";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Media";
      case "low": return "Baja";
      default: return "Sin prioridad";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "debt": return "💰";
      case "payment": return "💳";
      case "meeting": return "👥";
      case "task": return "📋";
      default: return "📝";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "debt": return "Deuda";
      case "payment": return "Pago";
      case "meeting": return "Reunión";
      case "task": return "Tarea";
      default: return "Otro";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "completed": return "Completado";
      case "cancelled": return "Cancelado";
      default: return "Desconocido";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#f5f5dc] border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <DialogHeader className="border-b-4 border-black pb-4 mb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-red-600">
            <div className="p-2 bg-red-600 text-white rounded-lg">
              <Trash2 className="h-5 w-5" />
            </div>
            Eliminar Recordatorio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertencia */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-800">¡Atención!</h3>
            </div>
            <p className="text-red-700 text-sm">
              Esta acción no se puede deshacer. El recordatorio será eliminado permanentemente.
            </p>
          </div>

          {/* Información del recordatorio */}
          <div className="bg-white p-6 rounded-lg border-2 border-black">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{getCategoryIcon(reminder.category)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-black text-lg">{reminder.title}</h3>
                  <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getPriorityColor(reminder.priority)}`}>
                    {getPriorityText(reminder.priority)}
                  </div>
                </div>
                
                {reminder.description && (
                  <p className="text-gray-600 mb-3">{reminder.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Vencimiento: {formatDate(reminder.dueDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Categoría: {getCategoryText(reminder.category)}
                    </span>
                    <span className="text-gray-600">
                      Estado: {getStatusText(reminder.status)}
                    </span>
                  </div>
                  
                  {reminder.isRecurring && (
                    <div className="text-gray-600">
                      Recurrente: {reminder.recurringFrequency}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Confirmación */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-gray-700 text-sm text-center">
              ¿Estás seguro de que deseas eliminar el recordatorio <strong>&quot;{reminder.title}&quot;</strong>?
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t-4 border-black">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 brutal-button"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 brutal-button bg-red-600 text-white hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Eliminando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Eliminar Recordatorio
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}