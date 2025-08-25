"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  CogIcon,
  ServerIcon,
  CloudIcon,
  ShieldCheckIcon,
  BellIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Mock system settings - En producción esto vendría de queries de Convex
const systemSettings = {
  app: {
    name: "FinanceZZ",
    version: "1.0.0",
    maintenanceMode: false,
    allowRegistrations: true,
    defaultCurrency: "COP",
    defaultLanguage: "es",
    timeZone: "America/Bogota"
  },
  billing: {
    stripeEnabled: true,
    testMode: true,
    defaultPlan: "free",
    trialDays: 14,
    gracePeriodDays: 3
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8
  },
  performance: {
    enableCaching: true,
    cacheTimeout: 300,
    enableCompression: true,
    enableCDN: true
  }
};

const systemStatus = {
  uptime: 99.98,
  totalUsers: 1250,
  activeUsers: 892,
  totalTransactions: 45320,
  storageUsed: 2.4, // GB
  storageLimit: 100, // GB
  apiCalls: 284567,
  errors: 12,
  responseTime: 187 // ms
};

export default function AdminSystemPage() {
  const { isSuperAdmin } = useAdmin();
  const [activeSection, setActiveSection] = useState<"general" | "billing" | "notifications" | "security" | "performance" | "status">("general");
  const [settings, setSettings] = useState(systemSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (section: string, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // TODO: Implement save to Convex
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los super administradores pueden acceder a la configuración del sistema.</p>
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
            <CogIcon className="w-8 h-8" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 font-medium">
            Gestionar configuraciones globales y estado del sistema
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Save Banner */}
        {hasChanges && (
          <Card className="border-4 border-yellow-500 shadow-brutal bg-yellow-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-800">
                    Tienes cambios sin guardar
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={saveSettings}
                    className="brutal-button bg-green-500 hover:bg-green-600 text-white"
                  >
                    Guardar Cambios
                  </Button>
                  <Button 
                    onClick={() => {
                      setSettings(systemSettings);
                      setHasChanges(false);
                    }}
                    className="brutal-button brutal-button--secondary"
                  >
                    Descartar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-1 border-2 border-black p-1 bg-white">
            {[
              { id: "general", label: "General", icon: CogIcon },
              { id: "billing", label: "Facturación", icon: CurrencyDollarIcon },
              { id: "notifications", label: "Notificaciones", icon: BellIcon },
              { id: "security", label: "Seguridad", icon: ShieldCheckIcon },
              { id: "performance", label: "Rendimiento", icon: ServerIcon },
              { id: "status", label: "Estado", icon: CloudIcon }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setActiveSection(id as "general" | "billing" | "notifications" | "security" | "performance" | "status")}
                className={`brutal-button ${
                  activeSection === id 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* General Settings */}
        {activeSection === "general" && (
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configuraciones básicas de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold uppercase">Nombre de la Aplicación</Label>
                  <Input
                    value={settings.app.name}
                    onChange={(e) => updateSetting("app", "name", e.target.value)}
                    className="border-2 border-black"
                  />
                </div>
                <div>
                  <Label className="font-bold uppercase">Versión</Label>
                  <Input
                    value={settings.app.version}
                    disabled
                    className="border-2 border-black bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.app.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("app", "maintenanceMode", checked)}
                />
                <Label className="font-bold">Modo Mantenimiento</Label>
                {settings.app.maintenanceMode && (
                  <Badge className="bg-red-500 text-white border border-black">
                    ACTIVO
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.app.allowRegistrations}
                  onCheckedChange={(checked) => updateSetting("app", "allowRegistrations", checked)}
                />
                <Label className="font-bold">Permitir Registros</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-bold uppercase">Moneda por Defecto</Label>
                  <Select
                    value={settings.app.defaultCurrency}
                    onValueChange={(value) => updateSetting("app", "defaultCurrency", value)}
                  >
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                      <SelectItem value="USD">USD - Dólar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold uppercase">Idioma por Defecto</Label>
                  <Select
                    value={settings.app.defaultLanguage}
                    onValueChange={(value) => updateSetting("app", "defaultLanguage", value)}
                  >
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-bold uppercase">Zona Horaria</Label>
                  <Select
                    value={settings.app.timeZone}
                    onValueChange={(value) => updateSetting("app", "timeZone", value)}
                  >
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">América/Bogotá</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">América/Nueva_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        {activeSection === "status" && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-4 border-black shadow-brutal bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    <Badge className="bg-green-500 text-white border border-black">
                      SALUDABLE
                    </Badge>
                  </div>
                  <div className="text-3xl font-black text-green-900">
                    {systemStatus.uptime}%
                  </div>
                  <div className="text-sm font-bold uppercase text-green-700">
                    Tiempo Activo
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ServerIcon className="w-8 h-8 text-blue-600" />
                    <Badge variant="outline" className="border-black">
                      {systemStatus.responseTime}ms
                    </Badge>
                  </div>
                  <div className="text-3xl font-black">
                    {systemStatus.activeUsers}
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-600">
                    Usuarios Activos
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CloudIcon className="w-8 h-8 text-purple-600" />
                    <div className="text-xs text-gray-600">
                      {Math.round((systemStatus.storageUsed / systemStatus.storageLimit) * 100)}%
                    </div>
                  </div>
                  <div className="text-3xl font-black">
                    {systemStatus.storageUsed}GB
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-600">
                    Almacenamiento
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded"
                      style={{ width: `${(systemStatus.storageUsed / systemStatus.storageLimit) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-black shadow-brutal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                    <Badge className={`border border-black ${
                      systemStatus.errors > 0 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {systemStatus.errors > 0 ? 'ERRORES' : 'OK'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-black">
                    {systemStatus.errors}
                  </div>
                  <div className="text-sm font-bold uppercase text-gray-600">
                    Errores (24h)
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Status */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <CardTitle>Estado Detallado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase">Servicios</h3>
                    <div className="space-y-2">
                      {[
                        { name: "API Principal", status: "online", uptime: "99.9%" },
                        { name: "Base de Datos", status: "online", uptime: "100%" },
                        { name: "Autenticación", status: "online", uptime: "99.8%" },
                        { name: "Pagos (Stripe)", status: "online", uptime: "99.9%" },
                        { name: "Notificaciones", status: "maintenance", uptime: "95.2%" },
                      ].map((service) => (
                        <div key={service.name} className="flex items-center justify-between p-3 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              service.status === "online" ? "bg-green-500" :
                              service.status === "maintenance" ? "bg-yellow-500" :
                              "bg-red-500"
                            }`}></div>
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">{service.uptime}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase">Métricas</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 border border-gray-200">
                        <span>Total Usuarios</span>
                        <span className="font-bold">{systemStatus.totalUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-3 border border-gray-200">
                        <span>Transacciones Totales</span>
                        <span className="font-bold">{systemStatus.totalTransactions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-3 border border-gray-200">
                        <span>Llamadas API (24h)</span>
                        <span className="font-bold">{systemStatus.apiCalls.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between p-3 border border-gray-200">
                        <span>Tiempo de Respuesta</span>
                        <span className="font-bold">{systemStatus.responseTime}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other sections would go here with similar patterns */}
        {activeSection !== "general" && activeSection !== "status" && (
          <Card className="border-4 border-black shadow-brutal">
            <CardContent className="p-12 text-center">
              <CogIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                {activeSection === "billing" && "Configuración de Facturación"}
                {activeSection === "notifications" && "Configuración de Notificaciones"}
                {activeSection === "security" && "Configuración de Seguridad"}
                {activeSection === "performance" && "Configuración de Rendimiento"}
              </h3>
              <p className="text-gray-500">
                Esta sección estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}