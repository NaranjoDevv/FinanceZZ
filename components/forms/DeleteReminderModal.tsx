"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { 
  TrashIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  XMarkIcon,
  CreditCardIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
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
      case "debt": return <CreditCardIcon className="h-8 w-8 text-gray-600" />;
      case "payment": return <CreditCardIcon className="h-8 w-8 text-gray-600" />;
      case "meeting": return <UserGroupIcon className="h-8 w-8 text-gray-600" />;
      case "task": return <ClipboardDocumentListIcon className="h-8 w-8 text-gray-600" />;
      default: return <DocumentTextIcon className="h-8 w-8 text-gray-600" />;
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-red-500 border-b-4 border-black p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black border-2 border-white">
                  <TrashIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wide">Eliminar Recordatorio</h2>
                  <p className="text-red-100 text-sm font-bold">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 bg-black border-2 border-white hover:bg-white hover:text-black transition-colors font-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Advertencia */}
            <div className="bg-red-100 border-4 border-red-500 p-4">
              <div className="flex items-center gap-3 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <h3 className="font-black text-red-800 uppercase tracking-wide">¡Atención!</h3>
              </div>
              <p className="text-red-700 text-sm font-bold">
                Esta acción no se puede deshacer. El recordatorio será eliminado permanentemente.
              </p>
            </div>

            {/* Información del recordatorio */}
            <div className="bg-gray-100 border-4 border-black p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white border-2 border-black">
                  {getCategoryIcon(reminder.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">{reminder.title}</h3>
                    <div className={`px-3 py-1 border-2 border-black text-xs font-black text-white uppercase tracking-wide ${getPriorityColor(reminder.priority)}`}>
                      {getPriorityText(reminder.priority)}
                    </div>
                  </div>
                  
                  {reminder.description && (
                    <p className="text-gray-600 mb-3 font-bold">
                      {reminder.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 font-bold">
                        Vencimiento: {formatDate(reminder.dueDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 font-bold">
                        Categoría: {getCategoryText(reminder.category)}
                      </span>
                      <span className="text-gray-600 font-bold">
                        Estado: {getStatusText(reminder.status)}
                      </span>
                    </div>
                    
                    {reminder.isRecurring && (
                      <div className="text-gray-600 font-bold">
                        Recurrente: {reminder.recurringFrequency}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmación */}
            <div className="bg-yellow-100 border-4 border-yellow-500 p-4">
              <p className="text-gray-700 text-sm text-center font-black uppercase tracking-wide">
                ¿Estás seguro de que deseas eliminar el recordatorio <strong>&quot;{reminder.title}&quot;</strong>?
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t-4 border-black">
              <button
                onClick={onClose}
                className="flex-1 h-12 bg-white border-4 border-black hover:bg-gray-100 font-black uppercase tracking-wide transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                disabled={isLoading}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleDelete}
                className="flex-1 h-12 bg-red-500 border-4 border-black text-white hover:bg-red-600 font-black uppercase tracking-wide transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <TrashIcon className="h-4 w-4" />
                    Eliminar Recordatorio
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}