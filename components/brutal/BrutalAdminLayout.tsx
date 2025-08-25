'use client';

import React, { memo, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrutalButton, BrutalCard, BrutalBadge } from './index';
import { BrutalQuickView, useBrutalQuickView } from './BrutalQuickView';
import {
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// ============================================
// BRUTAL ADMIN LAYOUT - Layout principal administrativo
// ============================================

interface BrutalAdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'danger' | 'success';
    onClick: () => void;
    icon?: ReactNode;
  }>;
  stats?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }>;
  quickViewEnabled?: boolean;
  moduleId?: string;
  className?: string;
}

export const BrutalAdminLayout = memo<BrutalAdminLayoutProps>(({
  children,
  title,
  subtitle,
  actions = [],
  stats = [],
  quickViewEnabled = true,
  moduleId,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOpen, data, loading, openQuickView, closeQuickView } = useBrutalQuickView();

  const handleQuickView = () => {
    if (moduleId) {
      openQuickView(moduleId);
    }
  };

  return (
    <>
      <div className={cn('min-h-screen bg-gray-50', className)}>
        {/* BRUTAL HEADER */}
        <div className="bg-black text-white border-b-8 border-yellow-400 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* LEFT SIDE */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-800 border-2 border-gray-600 hover:border-white transition-colors"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-wider">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wide">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">
                {quickViewEnabled && moduleId && (
                  <BrutalButton
                    variant="primary"
                    size="sm"
                    onClick={handleQuickView}
                    className="flex items-center gap-2"
                  >
                    <BoltIcon className="w-4 h-4" />
                    VISTA RÁPIDA
                  </BrutalButton>
                )}
                
                {actions.map((action, index) => (
                  <BrutalButton
                    key={index}
                    variant={action.variant}
                    size="sm"
                    onClick={action.onClick}
                    className={cn(
                      'flex items-center gap-2',
                      action.icon && 'pl-3'
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </BrutalButton>
                ))}
                
                <div className="flex items-center gap-2 pl-4 border-l-2 border-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  <BrutalBadge variant="success">ADMIN</BrutalBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR (if provided) */}
        {stats.length > 0 && (
          <div className="bg-white border-b-4 border-black">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-300 hover:border-black transition-colors"
                  >
                    <div>
                      <div className="text-xs font-black uppercase text-gray-600 mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xl font-black text-black">
                        {stat.value}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <BrutalBadge 
                        variant={
                          stat.type === 'success' ? 'success' :
                          stat.type === 'warning' ? 'warning' :
                          stat.type === 'danger' ? 'danger' : 'default'
                        }
                      >
                        {stat.type.toUpperCase()}
                      </BrutalBadge>
                      {stat.trendValue && (
                        <div className="text-xs font-bold text-gray-600 mt-1">
                          {stat.trendValue}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>

        {/* BRUTAL SIDEBAR */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 bg-white border-r-8 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] z-50 overflow-y-auto"
            >
              {/* SIDEBAR HEADER */}
              <div className="bg-black text-white p-6 border-b-4 border-yellow-400">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    MENÚ ADMIN
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-800 border-2 border-gray-600 hover:border-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* SIDEBAR CONTENT */}
              <div className="p-6">
                <div className="space-y-4">
                  <BrutalCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ChartBarIcon className="w-5 h-5" />
                      <span className="font-black uppercase text-sm">ESTADÍSTICAS</span>
                    </div>
                    <div className="text-xs text-gray-600 font-bold">
                      Sistema operativo al 99.9%
                    </div>
                  </BrutalCard>

                  <BrutalCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ClockIcon className="w-5 h-5" />
                      <span className="font-black uppercase text-sm">ÚLTIMA ACTIVIDAD</span>
                    </div>
                    <div className="text-xs text-gray-600 font-bold">
                      Hace 5 minutos
                    </div>
                  </BrutalCard>

                  <BrutalCard className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span className="font-black uppercase text-sm">ALERTAS</span>
                    </div>
                    <div className="text-xs text-gray-600 font-bold">
                      Sin alertas críticas
                    </div>
                  </BrutalCard>
                </div>

                <div className="mt-8 pt-6 border-t-4 border-black">
                  <BrutalButton
                    variant="danger"
                    fullWidth
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    CERRAR MENÚ
                    <ArrowRightIcon className="w-4 h-4" />
                  </BrutalButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* BRUTAL QUICK VIEW */}
      <BrutalQuickView
        isOpen={isOpen}
        onClose={closeQuickView}
        data={data}
        loading={loading}
      />
    </>
  );
});

BrutalAdminLayout.displayName = 'BrutalAdminLayout';

// ============================================
// BRUTAL MODULE CARD - Tarjeta de módulo
// ============================================

interface BrutalModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  stats?: {
    count: string | number;
    label: string;
    trend?: string;
  };
  status: 'active' | 'warning' | 'error';
  actions: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
  }>;
  className?: string;
  onClick?: () => void;
}

export const BrutalModuleCard = memo<BrutalModuleCardProps>(({
  title,
  description,
  icon,
  stats,
  status,
  actions,
  className,
  onClick
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <BrutalBadge variant="success">ACTIVO</BrutalBadge>;
      case 'warning':
        return <BrutalBadge variant="warning">ADVERTENCIA</BrutalBadge>;
      case 'error':
        return <BrutalBadge variant="danger">ERROR</BrutalBadge>;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <BrutalCard 
        className={cn(
          'p-6 h-full cursor-pointer transition-all duration-200',
          'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
          'border-4 hover:border-black'
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 border-4 border-black',
              status === 'active' && 'bg-green-500 text-white',
              status === 'warning' && 'bg-yellow-400 text-black',
              status === 'error' && 'bg-red-500 text-white'
            )}>
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black mb-1">
                {title}
              </h3>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <p className="text-sm font-bold text-gray-700 mb-4">
          {description}
        </p>

        {stats && (
          <div className="mb-6 p-3 bg-gray-50 border-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-black">
                  {stats.count}
                </div>
                <div className="text-xs font-bold uppercase text-gray-600">
                  {stats.label}
                </div>
              </div>
              {stats.trend && (
                <div className="text-sm font-bold text-green-600">
                  {stats.trend}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <BrutalButton
              key={index}
              variant={action.variant}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </BrutalButton>
          ))}
        </div>
      </BrutalCard>
    </motion.div>
  );
});

BrutalModuleCard.displayName = 'BrutalModuleCard';