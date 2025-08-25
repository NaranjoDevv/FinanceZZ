"use client";

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { BrutalButton } from '@/components/brutal';
import {
  PlusIcon,
  UserPlusIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BoltIcon
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
  onNavigate?: (path: string) => void;
}

const createDefaultActions = (onNavigate?: (path: string) => void): QuickAction[] => [
  {
    id: 'add-user',
    label: 'NUEVO USUARIO',
    icon: <UserPlusIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/users') : console.log('Navigate to users'),
    variant: 'primary',
    description: 'Crear nuevo usuario del sistema',
    shortcut: 'Ctrl+U'
  },
  {
    id: 'system-settings',
    label: 'CONFIGURACIÓN',
    icon: <CogIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/system') : console.log('Navigate to system settings'),
    variant: 'secondary',
    description: 'Acceder a configuración del sistema',
    shortcut: 'Ctrl+S'
  },
  {
    id: 'view-analytics',
    label: 'ANALÍTICAS',
    icon: <ChartBarIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/analytics') : console.log('Navigate to analytics'),
    variant: 'secondary',
    description: 'Ver estadísticas y reportes',
    shortcut: 'Ctrl+A'
  },
  {
    id: 'audit-logs',
    label: 'AUDITORÍA',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/audit') : console.log('Navigate to audit logs'),
    variant: 'secondary',
    description: 'Revisar logs de auditoría',
    shortcut: 'Ctrl+L'
  },
  {
    id: 'manage-currencies',
    label: 'MONEDAS',
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/currencies') : console.log('Navigate to currencies'),
    variant: 'secondary',
    description: 'Gestionar monedas del sistema',
    shortcut: 'Ctrl+M'
  },
  {
    id: 'permissions',
    label: 'PERMISOS',
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/permissions') : console.log('Navigate to permissions'),
    variant: 'secondary',
    description: 'Configurar permisos de usuario',
    shortcut: 'Ctrl+P'
  },
  {
    id: 'manage-plans',
    label: 'PLANES',
    icon: <BoltIcon className="w-5 h-5" />,
    onClick: () => onNavigate ? onNavigate('/admin/plans') : console.log('Navigate to plans'),
    variant: 'success',
    description: 'Gestionar planes de suscripción',
    shortcut: 'Ctrl+P'
  },
  {
    id: 'backup-system',
    label: 'RESPALDO',
    icon: <ArrowPathIcon className="w-5 h-5" />,
    onClick: () => console.log('Sistema de respaldo - Funcionalidad a implementar'),
    variant: 'secondary',
    description: 'Crear respaldo del sistema',
    shortcut: 'Ctrl+B'
  }
];

export const QuickActions = memo<QuickActionsProps>(({ 
  actions, 
  className,
  compact = false,
  onNavigate
}) => {
  const finalActions = actions || createDefaultActions(onNavigate);

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

      {/* Actions Grid - MOBILE OPTIMIZED */}
      <div className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        'auto-rows-fr' // Ensure equal height rows
      )}>
        {finalActions.map((action, index) => (
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
                loading={action.loading || false}
                onClick={action.onClick}
                className={cn(
                  'h-auto flex-col gap-2 py-4 px-3 min-h-[80px]',
                  'hover:scale-[1.02] transition-transform duration-200 touch-manipulation',
                  compact && 'py-3 px-2 min-h-[70px] text-xs'
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
            <span>{finalActions.length} acciones disponibles</span>
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