"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  CogIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLog {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: number;
  severity: "info" | "warning" | "error" | "critical";
  ipAddress?: string;
  userAgent?: string;
}

// Mock data - En producción esto vendría de queries de Convex
const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    adminUserId: "user1",
    adminName: "Super Admin",
    action: "create_subscription_plan",
    targetType: "plan",
    targetId: "plan123",
    details: JSON.stringify({ name: "Enterprise", priceMonthly: 4990000 }),
    timestamp: Date.now() - 3600000,
    severity: "info",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  },
  {
    id: "2",
    adminUserId: "user1",
    adminName: "Super Admin",
    action: "promote_user_to_admin",
    targetType: "user",
    targetId: "user456",
    details: JSON.stringify({ role: "admin", permissions: ["manage_users"] }),
    timestamp: Date.now() - 7200000,
    severity: "warning",
    ipAddress: "192.168.1.1"
  },
  {
    id: "3",
    adminUserId: "user2",
    adminName: "Admin User",
    action: "update_user_limits",
    targetType: "user",
    targetId: "user789",
    details: JSON.stringify({ oldLimits: { transactions: 10 }, newLimits: { transactions: 50 } }),
    timestamp: Date.now() - 10800000,
    severity: "info",
    ipAddress: "10.0.0.5"
  },
  {
    id: "4",
    adminUserId: "user1",
    adminName: "Super Admin",
    action: "delete_subscription_plan",
    targetType: "plan",
    targetId: "plan999",
    details: JSON.stringify({ name: "Old Plan", reason: "Discontinued" }),
    timestamp: Date.now() - 86400000,
    severity: "critical",
    ipAddress: "192.168.1.1"
  },
  {
    id: "5",
    adminUserId: "user3",
    adminName: "Moderator",
    action: "create_currency",
    targetType: "currency",
    targetId: "eur",
    details: JSON.stringify({ code: "EUR", name: "Euro", symbol: "€" }),
    timestamp: Date.now() - 172800000,
    severity: "info",
    ipAddress: "203.0.113.10"
  }
];

export default function AdminAuditPage() {
  const { canViewAuditLogs } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === "all" || log.action.includes(selectedAction);
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    
    return matchesSearch && matchesAction && matchesSeverity;
  });

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `hace ${days} día${days === 1 ? '' : 's'}`;
    if (hours > 0) return `hace ${hours} hora${hours === 1 ? '' : 's'}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`;
    return "hace menos de 1 minuto";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "error": return "bg-orange-500 text-white";
      case "warning": return "bg-yellow-500 text-black";
      case "info": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return ShieldExclamationIcon;
      case "error": return ExclamationTriangleIcon;
      case "warning": return ExclamationTriangleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getActionDescription = (action: string) => {
    const descriptions: { [key: string]: string } = {
      create_subscription_plan: "Crear Plan de Suscripción",
      update_subscription_plan: "Actualizar Plan de Suscripción",
      delete_subscription_plan: "Eliminar Plan de Suscripción",
      promote_user_to_admin: "Promover Usuario a Admin",
      update_user_limits: "Actualizar Límites de Usuario",
      create_currency: "Crear Moneda",
      update_currency: "Actualizar Moneda",
      delete_currency: "Eliminar Moneda",
      assign_permission: "Asignar Permiso",
      revoke_permission: "Revocar Permiso"
    };
    return descriptions[action] || action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  if (!canViewAuditLogs) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para ver los logs de auditoría.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2 flex items-center gap-3">
            <DocumentTextIcon className="w-8 h-8" />
            Logs de Auditoría
          </h1>
          <p className="text-gray-600 font-medium">
            Registro completo de acciones administrativas en el sistema
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-black bg-white">
            <CardContent className="p-4">
              <div className="text-2xl font-black">{mockAuditLogs.length}</div>
              <div className="text-sm font-bold uppercase text-gray-600">Total Eventos</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-red-50">
            <CardContent className="p-4">
              <div className="text-2xl font-black text-red-700">
                {mockAuditLogs.filter(log => log.severity === "critical").length}
              </div>
              <div className="text-sm font-bold uppercase text-red-600">Críticos</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-yellow-50">
            <CardContent className="p-4">
              <div className="text-2xl font-black text-yellow-700">
                {mockAuditLogs.filter(log => log.severity === "warning").length}
              </div>
              <div className="text-sm font-bold uppercase text-yellow-600">Advertencias</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-black bg-blue-50">
            <CardContent className="p-4">
              <div className="text-2xl font-black text-blue-700">
                {new Set(mockAuditLogs.map(log => log.adminUserId)).size}
              </div>
              <div className="text-sm font-bold uppercase text-blue-600">Admins Activos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-4 border-black shadow-brutal mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por admin, acción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-black"
                />
              </div>
              
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="create">Crear</SelectItem>
                  <SelectItem value="update">Actualizar</SelectItem>
                  <SelectItem value="delete">Eliminar</SelectItem>
                  <SelectItem value="promote">Promover</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue placeholder="Todas las severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Último día</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="border-4 border-black shadow-brutal">
          <CardHeader>
            <CardTitle>Eventos de Auditoría</CardTitle>
            <CardDescription>
              Mostrando {filteredLogs.length} de {mockAuditLogs.length} eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No se encontraron eventos de auditoría</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log, index) => {
                  const SeverityIcon = getSeverityIcon(log.severity);
                  const details = parseDetails(log.details);
                  
                  return (
                    <div 
                      key={log.id}
                      className={`border-l-4 p-4 bg-white border-gray-200 ${
                        log.severity === "critical" ? "border-l-red-500 bg-red-50" :
                        log.severity === "warning" ? "border-l-yellow-500 bg-yellow-50" :
                        log.severity === "error" ? "border-l-orange-500 bg-orange-50" :
                        "border-l-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <SeverityIcon className="w-5 h-5 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getSeverityColor(log.severity)} border border-black text-xs`}>
                                {log.severity.toUpperCase()}
                              </Badge>
                              <span className="font-bold">{getActionDescription(log.action)}</span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-4 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <UserIcon className="w-4 h-4" />
                                  {log.adminName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CogIcon className="w-4 h-4" />
                                  {log.targetType}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {getTimeAgo(log.timestamp)}
                                </span>
                              </div>
                            </div>

                            <div className="text-sm text-gray-800">
                              <div className="font-medium mb-1">Detalles:</div>
                              <div className="bg-gray-100 border border-gray-300 p-2 rounded font-mono text-xs overflow-x-auto">
                                {typeof details === 'object' ? 
                                  JSON.stringify(details, null, 2) : 
                                  details
                                }
                              </div>
                            </div>

                            {log.ipAddress && (
                              <div className="text-xs text-gray-500 mt-2">
                                IP: {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-xs text-gray-500 ml-4">
                          <div>{formatTimestamp(log.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="mt-6">
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle>Exportar Logs</CardTitle>
              <CardDescription>Descarga logs de auditoría para análisis externo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="brutal-button brutal-button--primary">
                  Exportar CSV
                </Button>
                <Button className="brutal-button brutal-button--secondary">
                  Exportar JSON
                </Button>
                <Button className="brutal-button bg-purple-500 hover:bg-purple-600 text-white">
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}