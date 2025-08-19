"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface Contact {
  _id: Id<"contacts">;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

interface DeleteContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export default function DeleteContactModal({
  isOpen,
  onClose,
  contact,
}: DeleteContactModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteContact = useMutation(api.contacts.deleteContact);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContact({ id: contact._id });
      toast.success("Contacto eliminado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Error al eliminar el contacto");
    } finally {
      setIsDeleting(false);
    }
  };

  // Clases CSS
  const buttonClass = "min-h-[48px] py-3 px-6 flex items-center justify-center brutal-button";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-[#f5f5dc] border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <DialogHeader className="border-b-4 border-black pb-4 mb-6">
          <DialogTitle className="text-2xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-red-600 text-white rounded-lg">
              <Trash2 className="h-5 w-5" />
            </div>
            Eliminar Contacto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">¡Atención!</h3>
                <p className="text-sm text-red-700">
                  Esta acción no se puede deshacer. El contacto será eliminado permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white border-2 border-black rounded-lg p-4">
            <h4 className="font-bold text-black mb-2">Contacto a eliminar:</h4>
            <div className="space-y-1">
              <p className="text-black font-medium">{contact.name}</p>
              {contact.email && (
                <p className="text-sm text-gray-600">{contact.email}</p>
              )}
              {contact.phone && (
                <p className="text-sm text-gray-600">{contact.phone}</p>
              )}
            </div>
          </div>

          {/* Confirmation */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              ¿Estás seguro de que deseas eliminar este contacto? Esta acción es irreversible.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t-4 border-black">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className={`${buttonClass} flex-1`}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className={`${buttonClass} flex-1 bg-red-600 text-white hover:bg-red-700`}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}