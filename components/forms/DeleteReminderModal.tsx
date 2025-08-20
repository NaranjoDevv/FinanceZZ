"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { BrutalConfirmationModal } from "@/components/ui/brutal-confirmation-modal";
import { Id } from "@/convex/_generated/dataModel";
import {
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface DeleteReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: {
    _id: Id<"reminders">;
    title: string;
    description?: string;
    dueDate: number;
    priority: "low" | "medium" | "high" | "urgent";
    category?: string;
    status: "pending" | "completed" | "cancelled";
  };
}

export default function DeleteReminderModal({
  isOpen,
  onClose,
  reminder,
}: DeleteReminderModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useMutation(api.reminders.deleteReminder);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation({
        id: reminder._id as Id<"reminders">
      });
      toast.success("Recordatorio eliminado exitosamente");
      onClose();
    } catch (error) {
      toast.error("Error al eliminar el recordatorio");
      console.error("Error deleting reminder:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      default:
        return "Baja";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-purple-600";
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  const itemDetails = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Título:</span>
        </div>
        <span className="font-bold text-black text-sm">{reminder.title}</span>
      </div>
      
      {reminder.description && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-600 text-sm">Descripción:</span>
          </div>
          <span className="font-bold text-black text-sm max-w-[200px] truncate">
            {reminder.description}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Fecha:</span>
        </div>
        <span className="font-bold text-black text-sm">
          {new Date(reminder.dueDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Prioridad:</span>
        </div>
        <span className={`font-bold text-sm ${getPriorityColor(reminder.priority)}`}>
          {getPriorityText(reminder.priority)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Estado:</span>
        </div>
        <span className={`font-bold text-sm ${
          reminder.status === "completed" ? "text-green-600" : "text-orange-600"
        }`}>
          {reminder.status === "completed" ? "Completado" : reminder.status === "pending" ? "Pendiente" : "Cancelado"}
        </span>
      </div>
    </div>
  );

  return (
    <BrutalConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Eliminar Recordatorio"
      description="¿Estás seguro de que quieres eliminar este recordatorio? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      isLoading={isDeleting}
      itemDetails={itemDetails}
    />
  );
}