"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  growthRate: number;
  conversionRate: number;
  churnRate: number;
}

// Mock data - En producción esto vendría de queries de Convex
const mockAnalyticsData: AnalyticsData = {
  totalUsers: 1250,
  activeUsers: 892,
  premiumUsers: 156,
  totalTransactions: 45320,
  totalRevenue: 87450000, // En centavos COP
  growthRate: 12.5,
  conversionRate: 8.3,
  churnRate: 2.1
};

const monthlyData = [
  { month: "Ene", users: 850, revenue: 65000000, transactions: 32100 },
  { month: "Feb", users: 920, revenue: 72000000, transactions: 36800 },
  { month: "Mar", users: 1050, revenue: 78500000, transactions: 41200 },
  { month: "Abr", users: 1180, revenue: 82300000, transactions: 43900 },
  { month: "May", users: 1250, revenue: 87450000, transactions: 45320 },
];

export default function AdminAnalyticsPage() {
  const { canViewAnalytics } = useAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num: number, showSign: boolean = true) => {
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  if (!canViewAnalytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para ver las analíticas.</p>
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
            <ChartBarIcon className="w-8 h-8" />
            Analíticas del Sistema
          </h1>
          <p className="text-gray-600 font-medium">
            Métricas y estadísticas del rendimiento de FinanceZZ
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-500 text-white border border-black">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  {formatPercentage(mockAnalyticsData.growthRate)}
                </Badge>
              </div>
              <div className="text-3xl font-black text-blue-900 mb-1">
                {formatNumber(mockAnalyticsData.totalUsers)}
              </div>
              <div className="text-sm font-bold uppercase text-blue-700">
                Usuarios Totales
              </div>
              <div className="text-xs text-blue-600 mt-2">
                {formatNumber(mockAnalyticsData.activeUsers)} activos
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-500 text-white border border-black">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  {formatPercentage(15.2)}
                </Badge>
              </div>
              <div className="text-3xl font-black text-green-900 mb-1">
                {formatCurrency(mockAnalyticsData.totalRevenue)}
              </div>
              <div className="text-sm font-bold uppercase text-green-700">
                Ingresos Totales
              </div>
              <div className="text-xs text-green-600 mt-2">
                {formatNumber(mockAnalyticsData.premiumUsers)} usuarios premium
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CreditCardIcon className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-500 text-white border border-black">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  {formatPercentage(mockAnalyticsData.conversionRate, false)}
                </Badge>
              </div>
              <div className="text-3xl font-black text-purple-900 mb-1">
                {formatNumber(mockAnalyticsData.totalTransactions)}
              </div>
              <div className="text-sm font-bold uppercase text-purple-700">
                Transacciones
              </div>
              <div className="text-xs text-purple-600 mt-2">
                Tasa de conversión {formatPercentage(mockAnalyticsData.conversionRate, false)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
                <Badge className="bg-red-500 text-white border border-black">
                  {formatPercentage(mockAnalyticsData.churnRate, false)}
                </Badge>
              </div>
              <div className="text-3xl font-black text-red-900 mb-1">
                {formatPercentage(mockAnalyticsData.churnRate, false)}
              </div>
              <div className="text-sm font-bold uppercase text-red-700">
                Tasa de Abandono
              </div>
              <div className="text-xs text-red-600 mt-2">
                Mensual promedio
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Crecimiento de Usuarios
              </CardTitle>
              <CardDescription>Evolución mensual de usuarios registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => {
                  const prevMonth = index > 0 ? monthlyData[index - 1] : null;
                  const growth = prevMonth ? ((data.users - prevMonth.users) / prevMonth.users * 100) : 0;
                  
                  return (
                    <div key={data.month} className="flex items-center justify-between p-3 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-sm w-8">{data.month}</div>
                        <div className="w-32 bg-gray-200 rounded h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded transition-all duration-500"
                            style={{ width: `${(data.users / 1500) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatNumber(data.users)}</div>
                        <div className={`text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {growth !== 0 && formatPercentage(growth)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Ingresos Mensuales
              </CardTitle>
              <CardDescription>Evolución de ingresos por suscripciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => {
                  const prevMonth = index > 0 ? monthlyData[index - 1] : null;
                  const growth = prevMonth ? ((data.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0;
                  
                  return (
                    <div key={data.month} className="flex items-center justify-between p-3 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-sm w-8">{data.month}</div>
                        <div className="w-32 bg-gray-200 rounded h-2">
                          <div 
                            className="bg-green-500 h-2 rounded transition-all duration-500"
                            style={{ width: `${(data.revenue / 90000000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(data.revenue)}</div>
                        <div className={`text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {growth !== 0 && formatPercentage(growth)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gratuito</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded h-2">
                      <div className="bg-gray-500 h-2 rounded" style={{ width: "87.5%" }}></div>
                    </div>
                    <span className="text-sm font-bold">87.5%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Premium</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded h-2">
                      <div className="bg-yellow-500 h-2 rounded" style={{ width: "12.5%" }}></div>
                    </div>
                    <span className="text-sm font-bold">12.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">Top Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transacciones</span>
                  <Badge variant="outline" className="border-black">98.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Categorías</span>
                  <Badge variant="outline" className="border-black">87.4%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deudas</span>
                  <Badge variant="outline" className="border-black">65.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reportes</span>
                  <Badge variant="outline" className="border-black">43.2%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <Badge className="bg-green-500 text-white border border-black">99.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Response</span>
                  <Badge className="bg-blue-500 text-white border border-black">12%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <Badge className="bg-green-500 text-white border border-black">0.01%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Sessions</span>
                  <Badge variant="outline" className="border-black">{formatNumber(892)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="mt-8">
          <Card className="border-4 border-black shadow-brutal">
            <CardHeader>
              <CardTitle>Exportar Datos</CardTitle>
              <CardDescription>Descarga reportes detallados para análisis externo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="brutal-button brutal-button--primary">
                  Exportar CSV
                </Button>
                <Button className="brutal-button brutal-button--secondary">
                  Exportar PDF
                </Button>
                <Button className="brutal-button bg-green-500 hover:bg-green-600 text-white">
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}