"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BrutalButton, BrutalCard, BrutalBadge } from '@/components/brutal';
import {
  PlusIcon,
  UserPlusIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  FireIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  description?: string;
  shortcut?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
  compact?: boolean;
  maxColumns?: number;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'add-user',
    label: 'NUEVO USUARIO',
    icon: <UserPlusIcon className="w-5 h-5" />,
    onClick: () => console.log('Add user'),
    variant: 'primary',
    description: 'Crear nuevo usuario del sistema',
    shortcut: 'Ctrl+U'
  },
  {
    id: 'system-settings',
    label: 'CONFIGURACIÓN',
    icon: <CogIcon className="w-5 h-5" />,
    onClick: () => console.log('System settings'),
    variant: 'secondary',
    description: 'Acceder a configuración del sistema',
    shortcut: 'Ctrl+S'
  },
  {
    id: 'view-analytics',
    label: 'ANALÍTICAS',
    icon: <ChartBarIcon className="w-5 h-5" />,
    onClick: () => console.log('View analytics'),
    variant: 'secondary',
    description: 'Ver estadísticas y reportes',
    shortcut: 'Ctrl+A'
  },
  {
    id: 'audit-logs',
    label: 'AUDITORÍA',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    onClick: () => console.log('Audit logs'),
    variant: 'secondary',
    description: 'Revisar logs de auditoría',
    shortcut: 'Ctrl+L'
  },
  {
    id: 'send-notification',
    label: 'NOTIFICACIÓN',
    icon: <BellIcon className="w-5 h-5" />,
    onClick: () => console.log('Send notification'),
    variant: 'secondary',
    description: 'Enviar notificación masiva',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'manage-currencies',
    label: 'MONEDAS',
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    onClick: () => console.log('Manage currencies'),
    variant: 'secondary',
    description: 'Gestionar monedas del sistema',
    shortcut: 'Ctrl+M'
  },
  {
    id: 'permissions',
    label: 'PERMISOS',
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    onClick: () => console.log('Manage permissions'),
    variant: 'secondary',
    description: 'Configurar permisos de usuario',
    shortcut: 'Ctrl+P'
  },
  {
    id: 'backup-system',
    label: 'RESPALDO',
    icon: <ArrowPathIcon className="w-5 h-5" />,
    onClick: () => console.log('Backup system'),
    variant: 'success',
    description: 'Crear respaldo del sistema',
    shortcut: 'Ctrl+B'
  }
];

export const QuickActions = memo<QuickActionsProps>(({ 
  actions = DEFAULT_ACTIONS, 
  className,
  compact = false,
  maxColumns = 4
}) => {
  const gridCols = Math.min(actions.length, maxColumns);
  
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      compact ? 'p-4' : 'p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-400 border-4 border-black">
          <PlusIcon className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black">
            ACCIONES RÁPIDAS
          </h2>
          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
            Funciones administrativas frecuentes
          </p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className={cn(
        'grid gap-3',
        gridClasses[gridCols as keyof typeof gridClasses] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      )}>
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="group"
          >
            <div className="relative">
              <BrutalButton
                variant={action.variant || 'secondary'}
                size={compact ? 'sm' : 'md'}
                fullWidth
                disabled={action.disabled}
                loading={action.loading}
                onClick={action.onClick}
                className={cn(
                  'h-auto flex-col gap-2 py-4 px-3',
                  'hover:scale-[1.02] transition-transform duration-200',
                  compact && 'py-3 px-2'
                )}
              >
                <div className="flex items-center justify-center">
                  {action.icon}
                </div>
                <span className={cn(
                  'text-center leading-tight',
                  compact ? 'text-xs' : 'text-sm'
                )}>
                  {action.label}
                </span>
                {action.shortcut && !compact && (
                  <span className="text-xs opacity-60 font-normal">
                    {action.shortcut}
                  </span>
                )}
              </BrutalButton>

              {/* Tooltip */}
              {action.description && (
                <div className={cn(
                  'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2',
                  'bg-black text-white text-xs font-bold px-3 py-2',
                  'border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                  'pointer-events-none z-10 whitespace-nowrap'
                )}>
                  {action.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      {!compact && (
        <div className="mt-6 pt-4 border-t-4 border-black">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600 uppercase tracking-wide">
            <span>{actions.length} acciones disponibles</span>
            <span>Usa Ctrl + tecla para acceso rápido</span>
          </div>
        </div>
      )}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

// Hook para manejar shortcuts de teclado
export const useQuickActionShortcuts = (actions: QuickAction[]) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      
      const action = actions.find(action => {
        if (!action.shortcut) return false;
        const shortcutKey = action.shortcut.split('+').pop()?.toLowerCase();
        return shortcutKey === event.key.toLowerCase();
      });
      
      if (action && !action.disabled && !action.loading) {
        event.preventDefault();
        action.onClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};

export default QuickActions;