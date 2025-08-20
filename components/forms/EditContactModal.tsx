"use client";

import { useEffect } from "react";
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
import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";

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

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function EditContactModal({
  isOpen,
  onClose,
  contact,
}: EditContactModalProps) {
  const updateContact = useMutation(api.contacts.updateContact);

  const initialFormData: FormData = {
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    address: contact?.address || "",
    notes: contact?.notes || "",
  };

  const validationRules = createValidationRules<FormData>([
    {
      field: 'name',
      validators: [commonValidationRules.required('Nombre')],
    },
  ]);

  const submitContact = async (data: FormData) => {
    const updateData: {
      id: Id<"contacts">;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
    } = {
      id: contact._id,
      name: data.name.trim(),
    };
    
    if (data.email.trim()) updateData.email = data.email.trim();
    if (data.phone.trim()) updateData.phone = data.phone.trim();
    if (data.address.trim()) updateData.address = data.address.trim();
    if (data.notes.trim()) updateData.notes = data.notes.trim();
    
    await updateContact(updateData);
    toast.success("Contacto actualizado exitosamente");
  };

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    resetForm,
  } = useFormHandler({
    initialData: initialFormData,
    validationRules,
  });

  // Cargar datos del contacto cuando cambie
  useEffect(() => {
    if (contact) {
      updateField("name", contact.name || "");
      updateField("email", contact.email || "");
      updateField("phone", contact.phone || "");
      updateField("address", contact.address || "");
      updateField("notes", contact.notes || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  const handleClose = () => {
    resetForm();
    onClose();
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

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(submitContact);
        }} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nombre completo"
              className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm font-medium">
                {errors.name}
              </p>
            )}
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
              onChange={(e) => updateField("email", e.target.value)}
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
              onChange={(e) => updateField("phone", e.target.value)}
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
              onChange={(e) => updateField("address", e.target.value)}
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
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Notas adicionales sobre el contacto..."
              className={`${inputClass} min-h-[80px] resize-none`}
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-3 border-t-4 border-black">
            <Button
              type="button"
              onClick={handleClose}
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