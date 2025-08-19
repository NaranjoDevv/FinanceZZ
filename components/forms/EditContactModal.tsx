"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  PencilSquareIcon,
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

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export default function EditContactModal({
  isOpen,
  onClose,
  contact,
}: EditContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateContact = useMutation(api.contacts.updateContact);

  // Cargar datos del contacto cuando se abre el modal
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.address || "",
        notes: contact.notes || "",
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateContact({
        id: contact._id,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      toast.success("Contacto actualizado exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Error al actualizar el contacto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
      notes: contact.notes || "",
    });
    onClose();
  };

  // Clases CSS brutalistas
  const buttonClass = "bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-6 border-4 border-black uppercase tracking-wider transform hover:scale-105 transition-all duration-200";
  const inputClass = "w-full px-4 py-3 border-4 border-black bg-white text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors";

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative w-full max-w-[520px] mx-4 bg-white border-4 border-black shadow-2xl">
            {/* Header brutalista */}
            <div className="bg-green-400 border-b-4 border-black px-6 py-5 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black border-2 border-black">
                    <PencilSquareIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-black uppercase tracking-wide">
                    Editar Contacto
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 bg-red-500 border-2 border-black hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido del formulario */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-3">
                  <Label className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-blue-500 border-2 border-black">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    Nombre *
                  </Label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre completo"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-green-500 border-2 border-black">
                      <EnvelopeIcon className="h-5 w-5 text-white" />
                    </div>
                    Email
                  </Label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={inputClass}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-3">
                  <Label className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-purple-500 border-2 border-black">
                      <PhoneIcon className="h-5 w-5 text-white" />
                    </div>
                    Teléfono
                  </Label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 234 567 8900"
                    className={inputClass}
                  />
                </div>

                {/* Dirección */}
                <div className="space-y-3">
                  <Label className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-orange-500 border-2 border-black">
                      <MapPinIcon className="h-5 w-5 text-white" />
                    </div>
                    Dirección
                  </Label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Dirección completa"
                    className={inputClass}
                  />
                </div>

                {/* Notas */}
                <div className="space-y-3">
                  <Label className="text-lg font-black text-black flex items-center gap-3 uppercase tracking-wide">
                    <div className="p-2 bg-indigo-500 border-2 border-black">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    Notas
                  </Label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Notas adicionales sobre el contacto..."
                    className="w-full p-4 border-4 border-black bg-white text-black font-bold text-lg placeholder-gray-500 focus:outline-none focus:bg-yellow-100 focus:border-indigo-500 min-h-[120px] resize-none"
                    rows={4}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={buttonClass + " flex-1 bg-red-500 hover:bg-red-600 text-white"}
                    disabled={isSubmitting}
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className={buttonClass + " flex-1 bg-green-500 hover:bg-green-600 text-white"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ACTUALIZANDO...
                      </div>
                    ) : (
                      "ACTUALIZAR"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
