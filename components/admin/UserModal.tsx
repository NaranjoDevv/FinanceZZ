"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BrutalButton, BrutalModal, BrutalSelect, BrutalTextarea } from '@/components/brutal';
import { BrutalInput } from '@/components/ui/brutal-input';
import {
  UserIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  phone?: string;
  bio?: string;
  department?: string;
  permissions?: string[];
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit' | 'view';
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Usuario' },
  { value: 'moderator', label: 'Moderador' },
  { value: 'admin', label: 'Administrador' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'suspended', label: 'Suspendido' }
];

const DEPARTMENT_OPTIONS = [
  { value: 'finance', label: 'Finanzas' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'it', label: 'Tecnología' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Ventas' },
  { value: 'operations', label: 'Operaciones' }
];

const PERMISSION_OPTIONS = [
  { value: 'users:read', label: 'Ver usuarios' },
  { value: 'users:write', label: 'Editar usuarios' },
  { value: 'users:delete', label: 'Eliminar usuarios' },
  { value: 'transactions:read', label: 'Ver transacciones' },
  { value: 'transactions:write', label: 'Editar transacciones' },
  { value: 'reports:read', label: 'Ver reportes' },
  { value: 'settings:write', label: 'Configurar sistema' },
  { value: 'audit:read', label: 'Ver auditoría' }
];

const DEFAULT_USER: User = {
  name: '',
  email: '',
  role: 'user',
  status: 'active',
  phone: '',
  bio: '',
  department: '',
  permissions: []
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<User>(DEFAULT_USER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (isOpen) {
      if (user && (isEditing || mode === 'view')) {
        setFormData({ ...user });
        setAvatarPreview(user.avatar || '');
      } else {
        setFormData({ ...DEFAULT_USER });
        setAvatarPreview('');
      }
      setErrors({});
    }
  }, [isOpen, user, mode, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    if (!formData.status) {
      newErrors.status = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReadOnly) return;
    
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'Error al guardar el usuario. Inténtalo de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePermissionToggle = (permission: string) => {
    const currentPermissions = formData.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    handleInputChange('permissions', newPermissions);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        handleInputChange('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'CREAR NUEVO USUARIO';
      case 'edit': return 'EDITAR USUARIO';
      case 'view': return 'DETALLES DEL USUARIO';
      default: return 'USUARIO';
    }
  };

  const getSubmitButtonText = () => {
    if (isSaving) return 'GUARDANDO...';
    if (isCreating) return 'CREAR USUARIO';
    if (isEditing) return 'ACTUALIZAR USUARIO';
    return 'CERRAR';
  };

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} size="lg" title=''>
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-4 border-black bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-400 border-4 border-black">
                <UserIcon className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-black">
                {getModalTitle()}
              </h2>
            </div>
            
            <BrutalButton
              variant="secondary"
              onClick={onClose}
              className="p-2"
              disabled={isSaving}
            >
              <XMarkIcon className="w-5 h-5" />
            </BrutalButton>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100 border-4 border-red-500 flex items-center gap-3"
              >
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800 uppercase tracking-wide">
                  {errors.submit}
                </span>
              </motion.div>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border-4 border-black">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 border-4 border-black flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <Image 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                
                {!isReadOnly && (
                  <label className="absolute -bottom-2 -right-2 p-2 bg-blue-400 border-4 border-black cursor-pointer hover:bg-blue-500 transition-colors">
                    <PhotoIcon className="w-4 h-4 text-black" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {isReadOnly ? 'AVATAR DEL USUARIO' : 'SUBIR AVATAR'}
              </span>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrutalInput
                label="NOMBRE COMPLETO"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={errors.name}
                disabled={isReadOnly}
                required
              />
              
              <BrutalInput
                label="EMAIL"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                disabled={isReadOnly}
                required
              />
              
              <BrutalInput
                label="TELÉFONO"
                type="tel"
                value={formData.phone || ''}
                onChange={(value) => handleInputChange('phone', value)}
                disabled={isReadOnly}
              />
              
              <BrutalSelect
                label="DEPARTAMENTO"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                options={DEPARTMENT_OPTIONS}
                disabled={isReadOnly}
              />
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrutalSelect
                label="ROL"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                options={ROLE_OPTIONS}
                {...(errors.role && { error: errors.role })}
                disabled={isReadOnly}
                required
              />
              
              <BrutalSelect
                label="ESTADO"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                options={STATUS_OPTIONS}
                {...(errors.status && { error: errors.status })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Bio */}
            <BrutalTextarea
              label="BIOGRAFÍA"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={isReadOnly}
              placeholder="Información adicional sobre el usuario..."
              rows={3}
            />

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                PERMISOS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 border-4 border-black">
                {PERMISSION_OPTIONS.map((permission) => {
                  const isChecked = (formData.permissions || []).includes(permission.value);
                  
                  return (
                    <label
                      key={permission.value}
                      className={cn(
                        'flex items-center gap-3 p-3 border-2 border-black cursor-pointer transition-colors',
                        isChecked ? 'bg-green-100' : 'bg-white hover:bg-gray-100',
                        isReadOnly && 'cursor-not-allowed opacity-75'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => !isReadOnly && handlePermissionToggle(permission.value)}
                        disabled={isReadOnly}
                        className="w-4 h-4 border-2 border-black"
                      />
                      
                      <span className="font-bold text-sm uppercase tracking-wide text-black">
                        {permission.label}
                      </span>
                      
                      {isChecked && (
                        <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-black bg-gray-50">
          <div className="flex items-center justify-end gap-4">
            <BrutalButton
              variant="secondary"
              onClick={onClose}
              disabled={isSaving || isLoading}
            >
              CANCELAR
            </BrutalButton>
            
            {!isReadOnly && (
              <BrutalButton
                variant="primary"
                onClick={handleSubmit}
                disabled={isSaving || isLoading}
                loading={isSaving || isLoading}
                className="min-w-[150px]"
              >
                {getSubmitButtonText()}
              </BrutalButton>
            )}
          </div>
        </div>
      </div>
    </BrutalModal>
  );
};

export default UserModal;