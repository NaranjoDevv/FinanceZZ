"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
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

  // Clases CSS brutalistas
  const buttonClass = "bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-6 border-4 border-black uppercase tracking-wider transform hover:scale-105 transition-all duration-200";

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="relative w-full max-w-[450px] mx-4 bg-white border-4 border-black shadow-2xl">
            {/* Header brutalista */}
            <div className="bg-red-500 border-b-4 border-black px-6 py-5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black border-2 border-black">
                    <TrashIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                    Eliminar Contacto
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-black border-2 border-black hover:bg-gray-800 transition-colors"
                  disabled={isDeleting}
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Mensaje de advertencia brutalista */}
                <div className="bg-yellow-300 border-4 border-black p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500 border-2 border-black">
                      <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-black mb-3 text-xl uppercase tracking-wide">
                        ¿Estás seguro?
                      </h3>
                      <p className="text-black font-bold text-base leading-relaxed">
                        Esta acción no se puede deshacer. Se eliminará permanentemente el
                        contacto y todos sus datos asociados.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del contacto brutalista */}
                {contact && (
                  <div className="bg-gray-200 border-4 border-black p-6">
                    <h4 className="font-black text-black mb-4 text-xl uppercase tracking-wide">
                      Contacto a eliminar:
                    </h4>
                    <div className="space-y-3 text-base text-black">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-black uppercase tracking-wide min-w-[80px]">
                          Nombre:
                        </span>
                        <span className="font-bold text-black bg-white px-3 py-1 border-2 border-black">
                          {contact.name}
                        </span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-3">
                          <span className="font-black text-black uppercase tracking-wide min-w-[80px]">
                            Email:
                          </span>
                          <span className="font-bold text-black bg-white px-3 py-1 border-2 border-black">
                            {contact.email}
                          </span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-3">
                          <span className="font-black text-black uppercase tracking-wide min-w-[80px]">
                            Teléfono:
                          </span>
                          <span className="font-bold text-black bg-white px-3 py-1 border-2 border-black">
                            {contact.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botones brutalistas */}
                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <button
                    type="button"
                    onClick={onClose}
                    className={buttonClass + " flex-1 bg-gray-500 hover:bg-gray-600 text-white"}
                    disabled={isDeleting}
                  >
                    CANCELAR
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={buttonClass + " flex-1 bg-red-500 hover:bg-red-600 text-white"}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ELIMINANDO...
                      </div>
                    ) : (
                      "ELIMINAR"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}