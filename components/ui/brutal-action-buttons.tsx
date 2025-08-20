"use client";

import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

interface ActionButtonProps {
  variant: "create" | "edit" | "delete" | "view" | "refresh" | "save" | "cancel" | "duplicate" | "share" | "archive" | "custom";
  onClick: () => void;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  tooltip?: string | undefined;
}

const actionConfig = {
  create: {
    bg: "bg-green-500 hover:bg-green-600",
    icon: <PlusIcon className="w-4 h-4" />,
    label: "Crear",
    loadingText: "Creando..."
  },
  edit: {
    bg: "bg-blue-500 hover:bg-blue-600",
    icon: <PencilIcon className="w-4 h-4" />,
    label: "Editar",
    loadingText: "Editando..."
  },
  delete: {
    bg: "bg-red-500 hover:bg-red-600",
    icon: <TrashIcon className="w-4 h-4" />,
    label: "Eliminar",
    loadingText: "Eliminando..."
  },
  view: {
    bg: "bg-gray-500 hover:bg-gray-600",
    icon: <EyeIcon className="w-4 h-4" />,
    label: "Ver",
    loadingText: "Cargando..."
  },
  refresh: {
    bg: "bg-purple-500 hover:bg-purple-600",
    icon: <ArrowPathIcon className="w-4 h-4" />,
    label: "Actualizar",
    loadingText: "Actualizando..."
  },
  save: {
    bg: "bg-green-600 hover:bg-green-700",
    icon: <CheckIcon className="w-4 h-4" />,
    label: "Guardar",
    loadingText: "Guardando..."
  },
  cancel: {
    bg: "bg-gray-600 hover:bg-gray-700",
    icon: <XMarkIcon className="w-4 h-4" />,
    label: "Cancelar",
    loadingText: "Cancelando..."
  },
  duplicate: {
    bg: "bg-yellow-500 hover:bg-yellow-600",
    icon: <DocumentDuplicateIcon className="w-4 h-4" />,
    label: "Duplicar",
    loadingText: "Duplicando..."
  },
  share: {
    bg: "bg-indigo-500 hover:bg-indigo-600",
    icon: <ShareIcon className="w-4 h-4" />,
    label: "Compartir",
    loadingText: "Compartiendo..."
  },
  archive: {
    bg: "bg-orange-500 hover:bg-orange-600",
    icon: <ArchiveBoxIcon className="w-4 h-4" />,
    label: "Archivar",
    loadingText: "Archivando..."
  },
  custom: {
    bg: "bg-gray-500 hover:bg-gray-600",
    icon: null,
    label: "Acción",
    loadingText: "Procesando..."
  }
};

const sizeConfig = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base"
};

export function BrutalActionButton({
  variant,
  onClick,
  disabled = false,
  loading = false,
  size = "md",
  children,
  icon,
  className = "",
  tooltip
}: ActionButtonProps) {
  const config = actionConfig[variant];
  const sizeClass = sizeConfig[size];
  const displayIcon = icon || config.icon;
  const displayText = children || config.label;
  const loadingText = config.loadingText;

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ type: "spring", damping: 20 }}
      title={tooltip}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          brutal-button ${sizeClass} font-black uppercase tracking-wider text-white border-black
          ${config.bg} transition-all duration-200
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ArrowPathIcon className="w-4 h-4" />
            </motion.div>
          ) : (
            displayIcon
          )}
          <span className={size === "sm" ? "hidden sm:inline" : ""}>
            {loading ? loadingText : displayText}
          </span>
        </div>
      </Button>
    </motion.div>
  );
}

// Grupo de botones de acción
interface ActionButtonGroupProps {
  actions: Array<{
    variant: ActionButtonProps["variant"];
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: ReactNode;
    icon?: ReactNode;
    tooltip?: string;
  }>;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  className?: string;
  spacing?: "tight" | "normal" | "loose";
}

export function BrutalActionButtonGroup({
  actions,
  size = "md",
  orientation = "horizontal",
  className = "",
  spacing = "normal"
}: ActionButtonGroupProps) {
  const spacingClasses = {
    tight: orientation === "horizontal" ? "gap-1" : "gap-1",
    normal: orientation === "horizontal" ? "gap-2 sm:gap-3" : "gap-2",
    loose: orientation === "horizontal" ? "gap-3 sm:gap-4" : "gap-3"
  };

  const orientationClasses = {
    horizontal: "flex flex-wrap",
    vertical: "flex flex-col"
  };

  return (
    <motion.div
      className={`${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <BrutalActionButton
            variant={action.variant}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            size={size}
            icon={action.icon}
            tooltip={action.tooltip}
          >
            {action.children}
          </BrutalActionButton>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Botones flotantes de acción (FAB)
interface FloatingActionButtonProps {
  variant: ActionButtonProps["variant"];
  onClick: () => void;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  icon?: ReactNode;
  tooltip?: string | undefined;
  className?: string;
}

export function BrutalFloatingActionButton({
  variant,
  onClick,
  disabled = false,
  loading = false,
  position = "bottom-right",
  icon,
  tooltip,
  className = ""
}: FloatingActionButtonProps) {
  const config = actionConfig[variant];
  const displayIcon = icon || config.icon;

  const positionClasses = {
    "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
    "top-right": "top-4 right-4 sm:top-6 sm:right-6",
    "top-left": "top-4 left-4 sm:top-6 sm:left-6"
  };

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 15 }}
      title={tooltip}
    >
      <motion.button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-black shadow-brutal
          ${config.bg} text-white font-black transition-all duration-200
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-brutal-lg"}
          flex items-center justify-center
        `}
        whileHover={{ scale: disabled || loading ? 1 : 1.1 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.9 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
        ) : (
          <div className="w-5 h-5 sm:w-6 sm:h-6">
            {displayIcon}
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}

// Hook para manejar estados de acciones
export function useActionState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [disabledStates, setDisabledStates] = useState<Record<string, boolean>>({});

  const setLoading = (actionId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: loading }));
  };

  const setDisabled = (actionId: string, disabled: boolean) => {
    setDisabledStates(prev => ({ ...prev, [actionId]: disabled }));
  };

  const isLoading = (actionId: string) => loadingStates[actionId] || false;
  const isDisabled = (actionId: string) => disabledStates[actionId] || false;

  const executeAction = async (actionId: string, action: () => Promise<void>) => {
    try {
      setLoading(actionId, true);
      await action();
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      throw error;
    } finally {
      setLoading(actionId, false);
    }
  };

  return {
    setLoading,
    setDisabled,
    isLoading,
    isDisabled,
    executeAction
  };
}