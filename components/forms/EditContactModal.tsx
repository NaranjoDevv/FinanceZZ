"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, Phone, MapPin, FileText } from "lucide-react";
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

  // Clases CSS
  const buttonClass = "min-h-[48px] py-3 px-6 flex items-center justify-center brutal-button";
  const inputClass = "brutal-input";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#f5f5dc] border-4 border-black shadow-[8px_8px_0px_0px_#000] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b-4 border-black pb-3 mb-4">
          <DialogTitle className="text-xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded-lg">
              <User className="h-4 w-4" />
            </div>
            Editar Contacto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nombre completo"
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              className={inputClass}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              className={inputClass}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Dirección completa"
              className={inputClass}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas adicionales sobre el contacto..."
              className={`${inputClass} min-h-[80px] resize-none`}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-3 border-t-4 border-black">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className={`${buttonClass} flex-1`}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`${buttonClass} flex-1 bg-black text-white hover:bg-gray-800`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Contacto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}