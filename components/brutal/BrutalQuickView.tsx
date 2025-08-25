'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BrutalButton, BrutalCard, BrutalBadge, BrutalSkeleton } from './index';
import {
  XMarkIcon,
  EyeIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// ============================================
// BRUTAL QUICK VIEW - Vista rápida brutalista
// ============================================

interface QuickViewData {
  id: string;
  title: string;
  type: 'users' | 'analytics' | 'system' | 'transactions' | 'general';
  status: 'active' | 'warning' | 'error' | 'loading';
  stats: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }>;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
  }>;
  lastUpdated?: string;
  description?: string;
}

interface BrutalQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  data?: QuickViewData | null;
  loading?: boolean;
}

export const BrutalQuickView = memo<BrutalQuickViewProps>(({
  isOpen,
  onClose,
  data,
  loading = false
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users':
        return <UsersIcon className="w-6 h-6" />;
      case 'analytics':
        return <ChartBarIcon className="w-6 h-6" />;
      case 'system':
        return <CheckCircleIcon className="w-6 h-6" />;
      default:
        return <InformationCircleIcon className="w-6 h-6" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence onExitComplete={() => setAnimationComplete(false)}>
      {isOpen && (
        <>
          {/* BRUTAL OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* BRUTAL QUICK VIEW MODAL */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  duration: 0.3 
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: 50,
                transition: { duration: 0.2 }
              }}
              onAnimationComplete={() => setAnimationComplete(true)}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* BRUTAL HEADER */}
              <div className="bg-yellow-400 border-b-8 border-black p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-black text-yellow-400 border-4 border-black">
                      <EyeIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-wider text-black">
                        VISTA RÁPIDA
                      </h2>
                      <p className="text-base font-bold uppercase tracking-wide text-black opacity-80">
                        {data?.title || 'CARGANDO INFORMACIÓN...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {data && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(data.status)}
                        <BrutalBadge 
                          variant={
                            data.status === 'active' ? 'success' :
                            data.status === 'warning' ? 'warning' : 'danger'
                          }
                        >
                          {data.status.toUpperCase()}
                        </BrutalBadge>
                      </div>
                    )}
                    
                    <BrutalButton
                      variant="danger"
                      size="sm"
                      onClick={onClose}
                      className="p-2 min-h-auto"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </BrutalButton>
                  </div>
                </div>
              </div>

              {/* BRUTAL CONTENT */}
              <div className="p-8">
                {loading || !data ? (
                  <div className="space-y-6">
                    <BrutalSkeleton lines={5} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <BrutalCard key={i} className="p-4">
                          <BrutalSkeleton lines={3} />
                        </BrutalCard>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* INFO SECTION */}
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-gray-900 text-white border-4 border-black">
                          {getTypeIcon(data.type)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-wider text-black">
                            {data.title}
                          </h3>
                          {data.description && (
                            <p className="text-sm font-bold text-gray-700 mt-1">
                              {data.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {data.lastUpdated && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ClockIcon className="w-4 h-4" />
                          <span className="font-bold uppercase">
                            ÚLTIMA ACTUALIZACIÓN: {data.lastUpdated}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {data.stats.map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: animationComplete ? 1 : 0, 
                            y: animationComplete ? 0 : 20 
                          }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <BrutalCard className="p-6 hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black uppercase tracking-wider text-gray-600">
                                {stat.label}
                              </span>
                              <BrutalBadge variant={
                                stat.type === 'primary' ? 'default' :
                                stat.type === 'success' ? 'success' :
                                stat.type === 'warning' ? 'warning' : 'danger'
                              }>
                                {stat.type.toUpperCase()}
                              </BrutalBadge>
                            </div>
                            
                            <div className="text-3xl font-black text-black mb-2">
                              {stat.value}
                            </div>
                            
                            {stat.trend && stat.trendValue && (
                              <div className="flex items-center gap-2">
                                {getTrendIcon(stat.trend)}
                                <span className={cn(
                                  'text-sm font-bold',
                                  stat.trend === 'up' && 'text-green-600',
                                  stat.trend === 'down' && 'text-red-600',
                                  stat.trend === 'stable' && 'text-gray-600'
                                )}>
                                  {stat.trendValue}
                                </span>
                              </div>
                            )}
                          </BrutalCard>
                        </motion.div>
                      ))}
                    </div>

                    {/* ACTIONS */}
                    {data.actions && data.actions.length > 0 && (
                      <div className="border-t-8 border-black pt-6">
                        <h4 className="text-xl font-black uppercase tracking-wider text-black mb-4">
                          ACCIONES DISPONIBLES
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {data.actions.map((action, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ 
                                opacity: animationComplete ? 1 : 0, 
                                x: animationComplete ? 0 : -20 
                              }}
                              transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                            >
                              <BrutalButton
                                variant={action.variant}
                                onClick={action.onClick}
                                className="min-w-[120px]"
                              >
                                {action.label}
                              </BrutalButton>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

BrutalQuickView.displayName = 'BrutalQuickView';

// ============================================
// BRUTAL QUICK VIEW HOOK - Hook para datos
// ============================================

export const useBrutalQuickView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<QuickViewData | null>(null);
  const [loading, setLoading] = useState(false);

  const openQuickView = async (moduleId: string, dataFetcher?: () => Promise<QuickViewData>) => {
    setIsOpen(true);
    setLoading(true);
    
    try {
      if (dataFetcher) {
        const result = await dataFetcher();
        setData(result);
      } else {
        // Default mock data based on moduleId
        const mockData = generateMockData(moduleId);
        setData(mockData);
      }
    } catch (error) {
      console.error('Error fetching quick view data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const closeQuickView = () => {
    setIsOpen(false);
    setData(null);
    setLoading(false);
  };

  return {
    isOpen,
    data,
    loading,
    openQuickView,
    closeQuickView
  };
};

// ============================================
// MOCK DATA GENERATOR - Datos de ejemplo
// ============================================

const generateMockData = (moduleId: string): QuickViewData => {
  const baseData = {
    id: moduleId,
    lastUpdated: new Date().toLocaleString('es-ES'),
    status: 'active' as const,
  };

  switch (moduleId) {
    case 'users':
      return {
        ...baseData,
        title: 'GESTIÓN DE USUARIOS',
        type: 'users',
        description: 'Vista rápida del módulo de usuarios',
        stats: [
          { label: 'USUARIOS TOTALES', value: '1,247', trend: 'up', trendValue: '+12%', type: 'primary' },
          { label: 'USUARIOS ACTIVOS', value: '892', trend: 'up', trendValue: '+8%', type: 'success' },
          { label: 'NUEVOS HOY', value: '23', trend: 'stable', trendValue: 'Estable', type: 'secondary' },
          { label: 'BLOQUEADOS', value: '5', trend: 'down', trendValue: '-2', type: 'warning' },
          { label: 'ADMINS', value: '12', trend: 'stable', trendValue: 'Sin cambios', type: 'secondary' },
          { label: 'PENDIENTES', value: '8', trend: 'up', trendValue: '+3', type: 'warning' },
        ],
        actions: [
          { label: 'CREAR USUARIO', variant: 'primary', onClick: () => console.log('Create user') },
          { label: 'EXPORTAR DATOS', variant: 'secondary', onClick: () => console.log('Export') },
          { label: 'VER REPORTES', variant: 'secondary', onClick: () => console.log('Reports') },
        ]
      };

    case 'analytics':
      return {
        ...baseData,
        title: 'ANALÍTICAS DEL SISTEMA',
        type: 'analytics',
        description: 'Métricas y estadísticas en tiempo real',
        stats: [
          { label: 'TRANSACCIONES HOY', value: '2,847', trend: 'up', trendValue: '+24%', type: 'success' },
          { label: 'INGRESOS', value: '$12,450', trend: 'up', trendValue: '+15%', type: 'success' },
          { label: 'USUARIOS ACTIVOS', value: '623', trend: 'up', trendValue: '+7%', type: 'primary' },
          { label: 'TASA DE CONVERSIÓN', value: '3.2%', trend: 'stable', trendValue: 'Estable', type: 'secondary' },
          { label: 'ERRORES', value: '12', trend: 'down', trendValue: '-40%', type: 'warning' },
          { label: 'TIEMPO RESPUESTA', value: '245ms', trend: 'down', trendValue: '-12ms', type: 'success' },
        ],
        actions: [
          { label: 'VER DASHBOARD', variant: 'primary', onClick: () => console.log('Dashboard') },
          { label: 'EXPORTAR REPORTE', variant: 'secondary', onClick: () => console.log('Export') },
        ]
      };

    case 'system':
      return {
        ...baseData,
        title: 'ESTADO DEL SISTEMA',
        type: 'system',
        description: 'Monitoreo de infraestructura y servicios',
        status: 'active',
        stats: [
          { label: 'UPTIME', value: '99.9%', trend: 'stable', trendValue: 'Óptimo', type: 'success' },
          { label: 'CPU', value: '23%', trend: 'stable', trendValue: 'Normal', type: 'secondary' },
          { label: 'MEMORIA', value: '67%', trend: 'up', trendValue: '+5%', type: 'warning' },
          { label: 'DISCO', value: '45%', trend: 'stable', trendValue: 'Estable', type: 'secondary' },
          { label: 'CONEXIONES', value: '1,432', trend: 'up', trendValue: '+87', type: 'primary' },
          { label: 'RESPUESTA API', value: '124ms', trend: 'down', trendValue: '-8ms', type: 'success' },
        ],
        actions: [
          { label: 'VER LOGS', variant: 'secondary', onClick: () => console.log('Logs') },
          { label: 'REINICIAR SERVICIOS', variant: 'danger', onClick: () => console.log('Restart') },
        ]
      };

    default:
      return {
        ...baseData,
        title: 'MÓDULO GENERAL',
        type: 'general',
        description: 'Información general del módulo',
        stats: [
          { label: 'ELEMENTOS', value: '156', trend: 'stable', trendValue: 'Sin cambios', type: 'secondary' },
          { label: 'ACTIVOS', value: '134', trend: 'up', trendValue: '+12', type: 'success' },
          { label: 'INACTIVOS', value: '22', trend: 'down', trendValue: '-5', type: 'warning' },
        ],
        actions: [
          { label: 'VER DETALLES', variant: 'primary', onClick: () => console.log('Details') },
        ]
      };
  }
};