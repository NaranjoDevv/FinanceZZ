"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface FormValidationRule<T> {
  field: keyof T;
  validate: (value: any, formData: T) => string | null;
}

interface UseFormHandlerOptions<T> {
  initialData: T;
  validationRules?: FormValidationRule<T>[];
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface FormErrors {
  [key: string]: string;
}

export function useFormHandler<T extends Record<string, any>>({
  initialData,
  validationRules = [],
  onSuccess,
  onError,
  successMessage = "Operación completada exitosamente",
  errorMessage = "Error al procesar la operación"
}: UseFormHandlerOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset subcategory when category changes (common pattern)
      ...(field === 'categoryId' && { subcategoryId: null })
    }));

    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: "" }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    validationRules.forEach(rule => {
      const error = rule.validate(formData[rule.field], formData);
      if (error) {
        newErrors[rule.field as string] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validationRules]);

  const handleSubmit = useCallback(async (
    submitFunction: (data: T) => Promise<void>,
    options?: {
      skipValidation?: boolean;
      customSuccessMessage?: string;
      customErrorMessage?: string;
    }
  ) => {
    try {
      if (!options?.skipValidation && !validateForm()) {
        return false;
      }

      setIsSubmitting(true);
      await submitFunction(formData);
      
      toast.success(options?.customSuccessMessage || successMessage);
      
      if (onSuccess) {
        onSuccess(formData);
      }
      
      return true;
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      const message = error instanceof Error ? error.message : (options?.customErrorMessage || errorMessage);
      toast.error(message);
      
      if (onError) {
        onError(error);
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, successMessage, errorMessage, onSuccess, onError]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    setFieldError,
    clearErrors,
    setFormData
  };
}

// Common validation rules
export const commonValidationRules = {
  required: (fieldName: string) => (value: any) => 
    !value || (typeof value === 'string' && !value.trim()) 
      ? `${fieldName} es requerido` 
      : null,

  positiveAmount: (value: any) => 
    !value || parseFloat(value) <= 0 
      ? "El monto debe ser mayor a 0" 
      : null,

  nonNegativeAmount: (value: any) => 
    !value || parseFloat(value) < 0 
      ? "El monto no puede ser negativo" 
      : null,

  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? "Email inválido" : null;
  },

  minLength: (min: number) => (value: string) => 
    value && value.length < min 
      ? `Debe tener al menos ${min} caracteres` 
      : null,

  maxLength: (max: number) => (value: string) => 
    value && value.length > max 
      ? `No puede tener más de ${max} caracteres` 
      : null
};

// Helper function to create validation rules easily
export function createValidationRules<T>(
  rules: Array<{
    field: keyof T;
    validators: Array<(value: any, formData?: T) => string | null>;
  }>
): FormValidationRule<T>[] {
  return rules.map(rule => ({
    field: rule.field,
    validate: (value: any, formData: T) => {
      for (const validator of rule.validators) {
        const error = validator(value, formData);
        if (error) return error;
      }
      return null;
    }
  }));
}