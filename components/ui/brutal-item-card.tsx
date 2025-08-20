"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface ActionButton {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "edit" | "delete" | "view" | "primary" | "secondary";
  disabled?: boolean;
}

interface BrutalItemCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "error" | "info" | "neutral";
  };
  metadata?: Array<{
    label: string;
    value: string | ReactNode;
    icon?: ReactNode;
  }>;
  actions?: ActionButton[];
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  isSelected?: boolean;
  children?: ReactNode;
}

const badgeVariants = {
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
  neutral: "bg-gray-500 text-white"
};

const actionVariants = {
  edit: {
    bg: "bg-blue-500 hover:bg-blue-600",
    icon: <PencilIcon className="w-4 h-4" />
  },
  delete: {
    bg: "bg-red-500 hover:bg-red-600",
    icon: <TrashIcon className="w-4 h-4" />
  },
  view: {
    bg: "bg-gray-500 hover:bg-gray-600",
    icon: <EyeIcon className="w-4 h-4" />
  },
  primary: {
    bg: "bg-purple-500 hover:bg-purple-600",
    icon: <ChevronRightIcon className="w-4 h-4" />
  },
  secondary: {
    bg: "bg-gray-600 hover:bg-gray-700",
    icon: <ChevronRightIcon className="w-4 h-4" />
  }
};

export function BrutalItemCard({
  title,
  subtitle,
  description,
  icon,
  badge,
  metadata = [],
  actions = [],
  onClick,
  className = "",
  variant = "default",
  isSelected = false,
  children
}: BrutalItemCardProps) {
  const isClickable = !!onClick;
  const isCompact = variant === "compact";

  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          {icon && (
            <motion.div
              className="flex-shrink-0 p-2 bg-gray-100 border-2 border-black"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm sm:text-base text-black truncate uppercase tracking-wide">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 truncate">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Badge */}
              {badge && (
                <motion.span
                  className={`px-2 py-1 text-xs font-black uppercase tracking-wider border-2 border-black ${badgeVariants[badge.variant || "neutral"]} flex-shrink-0`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                >
                  {badge.text}
                </motion.span>
              )}
            </div>

            {/* Description */}
            {description && !isCompact && (
              <p className="text-xs sm:text-sm text-gray-700 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {metadata.length > 0 && !isCompact && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
              {item.icon && (
                <span className="text-gray-500 flex-shrink-0">
                  {item.icon}
                </span>
              )}
              <span className="text-gray-600 font-medium">{item.label}:</span>
              <span className="text-black font-bold truncate">{item.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Custom Children */}
      {children && (
        <motion.div
          className="mt-3 sm:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {actions.map((action, index) => {
            const actionConfig = actionVariants[action.variant || "secondary"];
            return (
              <Button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                className={`brutal-button h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white ${actionConfig.bg} border-black flex items-center gap-1 sm:gap-2`}
              >
                {action.icon || actionConfig.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            );
          })}
        </motion.div>
      )}
    </>
  );

  const baseClasses = `
    brutal-card p-3 sm:p-4 border-4 border-black bg-white transition-all duration-200
    ${isSelected ? "ring-4 ring-purple-500 ring-offset-2" : ""}
    ${isClickable ? "cursor-pointer hover:shadow-brutal-lg hover:-translate-y-1" : ""}
    ${className}
  `;

  if (isClickable) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", damping: 20 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 20 }}
    >
      {cardContent}
    </motion.div>
  );
}

// Componente para listas de tarjetas
interface BrutalItemListProps<T = unknown> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
  loading?: boolean;
  loadingCount?: number;
}

export function BrutalItemList<T = unknown>({
  items,
  renderItem,
  emptyState,
  className = "",
  loading = false,
  loadingCount = 3
}: BrutalItemListProps<T>) {
  if (loading) {
    return (
      <div className={`space-y-3 sm:space-y-4 ${className}`}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <motion.div
            key={index}
            className="brutal-card p-3 sm:p-4 border-4 border-black bg-white animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-300 border-2 border-black"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 border border-black w-3/4"></div>
                <div className="h-3 bg-gray-200 border border-black w-1/2"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return (
      <motion.div
        className={`brutal-card p-6 sm:p-8 border-4 border-black bg-white text-center ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {emptyState.icon && (
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
          >
            <div className="p-4 bg-gray-100 border-4 border-black">
              {emptyState.icon}
            </div>
          </motion.div>
        )}
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-black mb-2">
          {emptyState.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {emptyState.description}
        </p>
        {emptyState.action && (
          <Button
            onClick={emptyState.action.onClick}
            className="brutal-button bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-wider"
          >
            {emptyState.action.label}
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`space-y-3 sm:space-y-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}