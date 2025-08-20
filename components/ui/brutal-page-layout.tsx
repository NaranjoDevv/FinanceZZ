"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BrutalActionButton, BrutalFloatingActionButton } from "./brutal-action-buttons";
import { BrutalInput } from "./brutal-input";
import { BrutalSelect } from "./brutal-select";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

interface FilterOption {
  label: string;
  value: string;
}

interface PageAction {
  variant: "create" | "edit" | "delete" | "view" | "refresh" | "save" | "cancel" | "duplicate" | "share" | "archive" | "custom";
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  icon?: ReactNode;
  tooltip?: string;
}

interface BrutalPageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: PageAction[];
  floatingAction?: {
    variant: PageAction["variant"];
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    tooltip?: string;
  };
  searchable?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info";
  }>;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  showFilters?: boolean;
  loading?: boolean;
}

const statVariants = {
  default: "bg-gray-100 border-gray-500",
  success: "bg-green-100 border-green-500",
  warning: "bg-yellow-100 border-yellow-500",
  error: "bg-red-100 border-red-500",
  info: "bg-blue-100 border-blue-500"
};

export function BrutalPageLayout({
  title,
  subtitle,
  icon,
  actions = [],
  floatingAction,
  searchable,
  filters = [],
  stats = [],
  children,
  className = "",
  contentClassName = "",
  headerClassName = "",
  showFilters = true,
  loading = false
}: BrutalPageLayoutProps) {
  const hasFilters = (searchable || filters.length > 0) && showFilters;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <motion.header
        className={`bg-white border-b-4 border-black shadow-brutal ${headerClassName}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {icon && (
                <motion.div
                  className="p-2 sm:p-3 bg-purple-100 border-4 border-black"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                >
                  {icon}
                </motion.div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-black">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base text-gray-600 font-medium mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2 sm:gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {actions.map((action, index) => (
                  <BrutalActionButton
                    key={index}
                    variant={action.variant}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    loading={action.loading}
                    icon={action.icon}
                    tooltip={action.tooltip}
                    size="md"
                  >
                    {action.children}
                  </BrutalActionButton>
                ))}
              </motion.div>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={`p-3 sm:p-4 border-4 border-black ${statVariants[stat.variant || "default"]}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05, duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    {stat.icon && (
                      <span className="text-black">{stat.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-xl font-black text-black truncate">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Filters */}
      {hasFilters && (
        <motion.section
          className="bg-white border-b-4 border-black"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              {searchable && (
                <div className="flex-1 sm:max-w-md">
                  <BrutalInput
                    label=""
                    icon={<MagnifyingGlassIcon className="w-4 h-4" />}
                    type="text"
                    placeholder={searchable.placeholder || "Buscar..."}
                    value={searchable.value}
                    onChange={(value) => searchable.onChange(value)}
                  />
                </div>
              )}

              {/* Filters */}
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {filters.map((filter, index) => (
                    <div key={index} className="min-w-0 flex-shrink-0">
                      <BrutalSelect
                        label=""
                        icon={<FunnelIcon className="w-4 h-4" />}
                        placeholder={filter.placeholder || `Filtrar por ${filter.label}`}
                        value={filter.value}
                        onChange={(value) => filter.onChange(value)}
                        options={filter.options}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <motion.main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${contentClassName}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                className="brutal-card p-4 sm:p-6 border-4 border-black bg-white animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-300 border-2 border-black"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-300 border border-black w-3/4"></div>
                    <div className="h-3 bg-gray-200 border border-black w-1/2"></div>
                    <div className="h-3 bg-gray-200 border border-black w-2/3"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          children
        )}
      </motion.main>

      {/* Floating Action Button */}
      {floatingAction && (
        <BrutalFloatingActionButton
          variant={floatingAction.variant}
          onClick={floatingAction.onClick}
          disabled={floatingAction.disabled}
          loading={floatingAction.loading}
          icon={floatingAction.icon}
          tooltip={floatingAction.tooltip}
        />
      )}
    </div>
  );
}

// Layout específico para páginas de lista
interface BrutalListPageProps<T = unknown> extends Omit<BrutalPageLayoutProps, 'children'> {
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
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
}

export function BrutalListPage<T = unknown>({
  items,
  renderItem,
  emptyState,
  itemsPerPage,
  currentPage,
  onPageChange,
  totalItems,
  ...layoutProps
}: BrutalListPageProps<T>) {
  const hasItems = items.length > 0;
  const showPagination = itemsPerPage && currentPage !== undefined && onPageChange && totalItems;
  const totalPages = showPagination ? Math.ceil(totalItems / itemsPerPage) : 0;

  return (
    <BrutalPageLayout {...layoutProps}>
      {hasItems ? (
        <div className="space-y-4">
          {/* Items */}
          <div className="space-y-3 sm:space-y-4">
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
          </div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <motion.div
              className="flex justify-center mt-6 sm:mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex gap-2">
                <BrutalActionButton
                  variant="custom"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  size="sm"
                >
                  Anterior
                </BrutalActionButton>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`
                          w-8 h-8 border-2 border-black font-black text-xs
                          ${currentPage === page 
                            ? "bg-purple-500 text-white" 
                            : "bg-white text-black hover:bg-gray-100"
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <BrutalActionButton
                  variant="custom"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  size="sm"
                >
                  Siguiente
                </BrutalActionButton>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        emptyState && (
          <motion.div
            className="brutal-card p-8 sm:p-12 border-4 border-black bg-white text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {emptyState.icon && (
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
              >
                <div className="p-6 bg-gray-100 border-4 border-black">
                  {emptyState.icon}
                </div>
              </motion.div>
            )}
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black mb-4">
              {emptyState.title}
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              {emptyState.description}
            </p>
            {emptyState.action && (
              <BrutalActionButton
                variant="create"
                onClick={emptyState.action.onClick}
                size="lg"
              >
                {emptyState.action.label}
              </BrutalActionButton>
            )}
          </motion.div>
        )
      )}
    </BrutalPageLayout>
  );
}