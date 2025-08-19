"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, DocumentTextIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";


interface CreateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateContactModal({
  isOpen,
  onClose,
}: CreateContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createContact = useMutation(api.contacts.createContact);
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!currentUser?._id) {
      toast.error("Usuario no autenticado");
      return;
    }

    setIsSubmitting(true);
    try {
      await createContact({
        userId: currentUser._id,
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      
      toast.success("Contacto creado exitosamente");
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      onClose();
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Error al crear el contacto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    onClose();
  };

  // Clases CSS brutalistas
  const buttonClass = "min-h-[48px] py-3 px-6 flex items-center justify-center font-bold text-lg border-4 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95";
  const inputClass = "w-full px-4 py-3 text-lg font-semibold border-4 border-black bg-white focus:bg-yellow-200 focus:outline-none transition-all duration-200";

  if (!isOpen) return null;

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative w-full max-w-[520px] mx-4 bg-white border-4 border-black shadow-2xl">
            <div className="relative">
              {/* Header brutalista */}
              <div className="bg-yellow-400 border-b-4 border-black px-6 py-5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black border-2 border-black">
                      <UserPlusIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-wide">
                      Nuevo Contacto
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
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      className={`${inputClass} min-h-[100px] resize-none`}
                      rows={3}
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-6 border-t-4 border-black">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-black py-4 px-6 border-4 border-black uppercase tracking-wider transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 ${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin"></div>
                          CREANDO...
                        </div>
                      ) : (
                        "CREAR CONTACTO"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}