"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

interface Currency {
  _id: Id<"currencies">;
  code: string;
  name: string;
  symbol: string;
  position: "before" | "after";
  decimals: number;
  isActive: boolean;
  isDefault: boolean;
  exchangeRate?: number;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"users">;
}

interface CreateCurrencyForm {
  code: string;
  name: string;
  symbol: string;
  position: "before" | "after";
  decimals: number;
  exchangeRate: number;
}

const INITIAL_FORM_STATE: CreateCurrencyForm = {
  code: "",
  name: "",
  symbol: "",
  position: "before",
  decimals: 2,
  exchangeRate: 1,
};

export default function AdminCurrenciesPage() {
  const { allCurrencies, canManageCurrencies, canViewCurrencies, createCurrency } = useAdmin();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCurrencyForm>(INITIAL_FORM_STATE);

  const handleCreateCurrency = async () => {
    try {
      await createCurrency(formData);
      setIsCreateModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error creating currency:", error);
    }
  };

  const formatExchangeRate = (rate?: number) => {
    if (!rate) return "N/A";
    return new Intl.NumberFormat('es-ES', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 4 
    }).format(rate);
  };

  if (!canViewCurrencies) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para gestionar monedas.</p>
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
            <CurrencyDollarIcon className="w-8 h-8" />
            Gestión de Monedas
          </h1>
          <p className="text-gray-600 font-medium">
            Administrar monedas disponibles en el sistema
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Stats Overview */}
        {allCurrencies && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-black bg-white">
              <CardContent className="p-4">
                <div className="text-2xl font-black">{allCurrencies.length}</div>
                <div className="text-sm font-bold uppercase text-gray-600">Total Monedas</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-green-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-green-700">
                  {allCurrencies.filter(c => c.isActive).length}
                </div>
                <div className="text-sm font-bold uppercase text-green-600">Activas</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-yellow-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-yellow-700">
                  {allCurrencies.filter(c => c.isDefault).length}
                </div>
                <div className="text-sm font-bold uppercase text-yellow-600">Por Defecto</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-blue-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-blue-700">
                  {allCurrencies.filter(c => c.exchangeRate && c.exchangeRate !== 1).length}
                </div>
                <div className="text-sm font-bold uppercase text-blue-600">Con Tipo de Cambio</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        {canManageCurrencies && (
          <div className="mb-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="brutal-button brutal-button--primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Nueva Moneda
            </Button>
          </div>
        )}

        {/* Currencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCurrencies?.map((currency: Currency) => (
            <Card key={currency._id} className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-black uppercase flex items-center gap-2">
                    <span className="text-2xl">{currency.symbol}</span>
                    {currency.code}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {currency.isDefault && (
                      <Badge className="bg-yellow-500 text-black border border-black text-xs">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        DEFECTO
                      </Badge>
                    )}
                    {currency.isActive ? (
                      <Badge className="bg-green-500 text-white border border-black text-xs">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        ACTIVO
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border border-black text-xs">
                        INACTIVO
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  {currency.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currency Details */}
                <div className="border-2 border-black p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-xs uppercase text-gray-600">Posición</div>
                      <div className="font-medium">
                        {currency.position === "before" ? "Antes" : "Después"}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-xs uppercase text-gray-600">Decimales</div>
                      <div className="font-medium">{currency.decimals}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="font-bold text-xs uppercase text-gray-600">Tipo de Cambio (USD)</div>
                      <div className="font-medium">{formatExchangeRate(currency.exchangeRate)}</div>
                    </div>
                  </div>
                </div>

                {/* Example Format */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase">Ejemplo de Formato:</h4>
                  <div className="text-center p-3 border-2 border-black bg-white">
                    <div className="text-lg font-black">
                      {currency.position === "before" 
                        ? `${currency.symbol}1,234${currency.decimals > 0 ? '.' + '0'.repeat(currency.decimals) : ''}`
                        : `1,234${currency.decimals > 0 ? '.' + '0'.repeat(currency.decimals) : ''} ${currency.symbol}`
                      }
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManageCurrencies && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      className="brutal-button bg-blue-500 hover:bg-blue-600 text-white flex-1"
                      onClick={() => {
                        // TODO: Implementar edición
                        console.log("Edit currency:", currency._id);
                      }}
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      size="sm"
                      className="brutal-button bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => {
                        if (confirm(`¿Estás seguro de que deseas eliminar ${currency.name}?`)) {
                          // TODO: Implementar eliminación
                          console.log("Delete currency:", currency._id);
                        }
                      }}
                      title="Eliminar moneda"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Currency Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="border-4 border-black shadow-brutal bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Agregar Nueva Moneda
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setFormData(INITIAL_FORM_STATE);
                    }}
                    className="border-2 border-black"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code" className="font-bold uppercase">Código de Moneda</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="border-2 border-black"
                      placeholder="USD, EUR, COP"
                      maxLength={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="symbol" className="font-bold uppercase">Símbolo</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="$, €, £"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="font-bold uppercase">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="border-2 border-black"
                    placeholder="Dólar Estadounidense, Euro, Peso Colombiano"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position" className="font-bold uppercase">Posición del Símbolo</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, position: value as "before" | "after" }))}
                    >
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Antes del número ($100)</SelectItem>
                        <SelectItem value="after">Después del número (100€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="decimals" className="font-bold uppercase">Decimales</Label>
                    <Select
                      value={formData.decimals.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, decimals: parseInt(value) }))}
                    >
                      <SelectTrigger className="border-2 border-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 decimales (100)</SelectItem>
                        <SelectItem value="2">2 decimales (100.00)</SelectItem>
                        <SelectItem value="3">3 decimales (100.000)</SelectItem>
                        <SelectItem value="4">4 decimales (100.0000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="exchangeRate" className="font-bold uppercase">Tipo de Cambio (USD = 1)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.0001"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) || 1 }))}
                    className="border-2 border-black"
                    placeholder="1.0000"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Ejemplo: Si 1 USD = 4000 COP, ingresa 4000
                  </p>
                </div>

                {/* Preview */}
                <div className="border-2 border-black p-4 bg-gray-50">
                  <h4 className="font-bold uppercase mb-2">Vista Previa:</h4>
                  <div className="text-center">
                    <div className="text-2xl font-black">
                      {formData.position === "before" 
                        ? `${formData.symbol || '$'}1,234${formData.decimals > 0 ? '.' + '0'.repeat(formData.decimals) : ''}`
                        : `1,234${formData.decimals > 0 ? '.' + '0'.repeat(formData.decimals) : ''} ${formData.symbol || '$'}`
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formData.code || 'XXX'} - {formData.name || 'Nombre de la moneda'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleCreateCurrency}
                    className="brutal-button brutal-button--primary flex-1"
                    disabled={!formData.code || !formData.name || !formData.symbol}
                  >
                    Crear Moneda
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setFormData(INITIAL_FORM_STATE);
                    }}
                    className="brutal-button brutal-button--secondary flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}