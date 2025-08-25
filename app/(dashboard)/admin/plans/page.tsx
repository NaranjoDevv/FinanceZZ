"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";

interface SubscriptionPlan {
  _id: Id<"subscriptionPlans">;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly?: number;
  currency: string;
  isActive: boolean;
  limits: {
    monthlyTransactions: number;
    activeDebts: number;
    recurringTransactions: number;
    categories: number;
  };
  features: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"users">;
}

interface CreatePlanForm {
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  limits: {
    monthlyTransactions: number;
    activeDebts: number;
    recurringTransactions: number;
    categories: number;
  };
  features: string[];
  order: number;
}

const INITIAL_FORM_STATE: CreatePlanForm = {
  name: "",
  displayName: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  currency: "COP",
  limits: {
    monthlyTransactions: 10,
    activeDebts: 1,
    recurringTransactions: 2,
    categories: 2,
  },
  features: [],
  order: 1,
};

const AVAILABLE_FEATURES = [
  "basic_transactions",
  "unlimited_transactions", 
  "basic_categories",
  "unlimited_categories",
  "basic_debts",
  "unlimited_debts",
  "recurring_transactions",
  "advanced_reports",
  "currency_selection",
  "number_formatting",
  "priority_support",
  "api_access",
  "export_data",
  "custom_branding",
  "multi_user_access",
];

export default function AdminPlansPage() {
  const { 
    allPlans, 
    canCreatePlans, 
    canManagePlans, 
    createSubscriptionPlan, 
    updateSubscriptionPlan, 
    deleteSubscriptionPlan,
    toggleSubscriptionPlanStatus 
  } = useAdmin();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanForm>(INITIAL_FORM_STATE);

  const handleCreatePlan = async () => {
    try {
      const planData = {
        ...formData,
        ...(formData.priceYearly && formData.priceYearly > 0 && { priceYearly: formData.priceYearly })
      };
      
      await createSubscriptionPlan(planData);
      setIsCreateModalOpen(false);
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan) return;
    
    try {
      const updateData: {
        name: string;
        displayName: string;
        description: string;
        priceMonthly: number;
        priceYearly?: number;
        currency: string;
        limits: {
          monthlyTransactions: number;
          activeDebts: number;
          recurringTransactions: number;
          categories: number;
        };
        features: string[];
        order: number;
      } = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        priceMonthly: formData.priceMonthly,
        currency: formData.currency,
        limits: formData.limits,
        features: formData.features,
        order: formData.order,
      };
      
      if (formData.priceYearly && formData.priceYearly > 0) {
        updateData.priceYearly = formData.priceYearly;
      }
      
      await updateSubscriptionPlan(editingPlan._id, updateData);
      setIsEditModalOpen(false);
      setEditingPlan(null);
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el plan "${plan.displayName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      await deleteSubscriptionPlan(plan._id);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleTogglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      await toggleSubscriptionPlanStatus(plan._id);
    } catch (error) {
      console.error("Error toggling plan status:", error);
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly || 0,
      currency: plan.currency,
      limits: plan.limits,
      features: plan.features,
      order: plan.order,
    });
    setIsEditModalOpen(true);
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100); // Convert from cents
  };

  const getPlanTypeColor = (name: string) => {
    switch (name.toLowerCase()) {
      case "free":
        return "bg-gray-500";
      case "basic":
        return "bg-blue-500";
      case "premium":
        return "bg-green-500";
      case "enterprise":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!canCreatePlans && !canManagePlans) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para gestionar planes de suscripción.</p>
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
            <CreditCardIcon className="w-8 h-8" />
            Gestión de Planes
          </h1>
          <p className="text-gray-600 font-medium">
            Administrar planes de suscripción, precios y características
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Stats Overview */}
        {allPlans && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-black bg-white">
              <CardContent className="p-4">
                <div className="text-2xl font-black">{allPlans.length}</div>
                <div className="text-sm font-bold uppercase text-gray-600">Total Planes</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-green-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-green-700">
                  {allPlans.filter(p => p.isActive).length}
                </div>
                <div className="text-sm font-bold uppercase text-green-600">Activos</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-gray-700">
                  {allPlans.filter(p => !p.isActive).length}
                </div>
                <div className="text-sm font-bold uppercase text-gray-600">Inactivos</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black bg-blue-50">
              <CardContent className="p-4">
                <div className="text-2xl font-black text-blue-700">
                  {allPlans.filter(p => p.priceMonthly === 0).length}
                </div>
                <div className="text-sm font-bold uppercase text-blue-600">Gratuitos</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        {canCreatePlans && (
          <div className="mb-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="brutal-button brutal-button--primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Crear Nuevo Plan
            </Button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlans?.map((plan: SubscriptionPlan) => (
            <Card key={plan._id} className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-black uppercase">
                    {plan.displayName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPlanTypeColor(plan.name)} text-white border border-black`}>
                      {plan.name.toUpperCase()}
                    </Badge>
                    {plan.isActive ? (
                      <Badge className="bg-green-500 text-white border border-black">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        ACTIVO
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border border-black">
                        INACTIVO
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="border-2 border-black p-4 bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl font-black">
                      {plan.priceMonthly === 0 ? "GRATIS" : formatPrice(plan.priceMonthly, plan.currency)}
                    </div>
                    {plan.priceMonthly > 0 && (
                      <div className="text-sm text-gray-600">por mes</div>
                    )}
                    {plan.priceYearly && plan.priceYearly > 0 && (
                      <div className="text-sm text-green-600 font-bold mt-1">
                        {formatPrice(plan.priceYearly, plan.currency)}/año
                        <span className="block text-xs">
                          (ahorra {Math.round((1 - (plan.priceYearly / (plan.priceMonthly * 12))) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  <div className="mt-3 text-center">
                    {plan.isActive ? (
                      <Badge className="bg-green-500 text-white border border-black text-xs">
                        ✓ DISPONIBLE
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white border border-black text-xs">
                        ⚠ NO DISPONIBLE
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Limits */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase">Límites:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Transacciones: {plan.limits.monthlyTransactions === 999999 ? "∞" : plan.limits.monthlyTransactions}</div>
                    <div>Deudas: {plan.limits.activeDebts === 999999 ? "∞" : plan.limits.activeDebts}</div>
                    <div>Recurrentes: {plan.limits.recurringTransactions === 999999 ? "∞" : plan.limits.recurringTransactions}</div>
                    <div>Categorías: {plan.limits.categories === 999999 ? "∞" : plan.limits.categories}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase">Características:</h4>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-black">
                        {feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {plan.features.length > 3 && (
                      <Badge variant="outline" className="text-xs border-black">
                        +{plan.features.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    className="brutal-button brutal-button--secondary flex-1"
                    onClick={() => {
                      // View plan details
                    }}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  
                  {canManagePlans && (
                    <>
                      <Button
                        size="sm"
                        className="brutal-button bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => openEditModal(plan)}
                        title="Editar plan"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        className={`brutal-button ${
                          plan.isActive 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                        onClick={() => handleTogglePlanStatus(plan)}
                        title={plan.isActive ? 'Desactivar plan' : 'Activar plan'}
                      >
                        {plan.isActive ? (
                          <XMarkIcon className="w-4 h-4" />
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        className="brutal-button bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleDeletePlan(plan)}
                        title="Eliminar plan"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Plan Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="border-4 border-black shadow-brutal bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PencilIcon className="w-5 h-5" />
                    Editar Plan: {editingPlan?.displayName}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingPlan(null);
                      setFormData(INITIAL_FORM_STATE);
                    }}
                    className="border-2 border-black"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mismo contenido que el modal de creación, pero con valores del plan */}
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="font-bold uppercase">Nombre Interno</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="free, premium, enterprise"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-displayName" className="font-bold uppercase">Nombre Mostrado</Label>
                    <Input
                      id="edit-displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Plan Premium"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description" className="font-bold uppercase">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="border-2 border-black"
                    placeholder="Descripción del plan..."
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-priceMonthly" className="font-bold uppercase">Precio Mensual (centavos)</Label>
                    <Input
                      id="edit-priceMonthly"
                      type="number"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseInt(e.target.value) || 0 }))}
                      className="border-2 border-black"
                      placeholder="1990000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-priceYearly" className="font-bold uppercase">Precio Anual (centavos)</Label>
                    <Input
                      id="edit-priceYearly"
                      type="number"
                      value={formData.priceYearly}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseInt(e.target.value) || 0 }))}
                      className="border-2 border-black"
                      placeholder="19900000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-currency" className="font-bold uppercase">Moneda</Label>
                    <Input
                      id="edit-currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="COP"
                    />
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h3 className="font-bold uppercase mb-4">Límites del Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="edit-monthlyTransactions" className="font-bold text-sm">Transacciones/Mes</Label>
                      <Input
                        id="edit-monthlyTransactions"
                        type="number"
                        value={formData.limits.monthlyTransactions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, monthlyTransactions: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-activeDebts" className="font-bold text-sm">Deudas Activas</Label>
                      <Input
                        id="edit-activeDebts"
                        type="number"
                        value={formData.limits.activeDebts}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, activeDebts: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-recurringTransactions" className="font-bold text-sm">Trans. Recurrentes</Label>
                      <Input
                        id="edit-recurringTransactions"
                        type="number"
                        value={formData.limits.recurringTransactions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, recurringTransactions: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-categories" className="font-bold text-sm">Categorías</Label>
                      <Input
                        id="edit-categories"
                        type="number"
                        value={formData.limits.categories}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, categories: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-bold uppercase mb-4">Características del Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-${feature}`}
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="border-2 border-black"
                        />
                        <Label htmlFor={`edit-${feature}`} className="text-sm">
                          {feature.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div>
                  <Label htmlFor="edit-order" className="font-bold uppercase">Orden de Visualización</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="border-2 border-black w-32"
                    placeholder="1"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleEditPlan}
                    className="brutal-button brutal-button--primary flex-1"
                  >
                    Actualizar Plan
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingPlan(null);
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

        {/* Create Plan Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="border-4 border-black shadow-brutal bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Crear Nuevo Plan
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
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-bold uppercase">Nombre Interno</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="free, premium, enterprise"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="displayName" className="font-bold uppercase">Nombre Mostrado</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="Plan Premium"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="font-bold uppercase">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="border-2 border-black"
                    placeholder="Descripción del plan..."
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priceMonthly" className="font-bold uppercase">Precio Mensual (centavos)</Label>
                    <Input
                      id="priceMonthly"
                      type="number"
                      value={formData.priceMonthly}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceMonthly: parseInt(e.target.value) || 0 }))}
                      className="border-2 border-black"
                      placeholder="1990000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="priceYearly" className="font-bold uppercase">Precio Anual (centavos)</Label>
                    <Input
                      id="priceYearly"
                      type="number"
                      value={formData.priceYearly}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceYearly: parseInt(e.target.value) || 0 }))}
                      className="border-2 border-black"
                      placeholder="19900000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency" className="font-bold uppercase">Moneda</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="border-2 border-black"
                      placeholder="COP"
                    />
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h3 className="font-bold uppercase mb-4">Límites del Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="monthlyTransactions" className="font-bold text-sm">Transacciones/Mes</Label>
                      <Input
                        id="monthlyTransactions"
                        type="number"
                        value={formData.limits.monthlyTransactions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, monthlyTransactions: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="activeDebts" className="font-bold text-sm">Deudas Activas</Label>
                      <Input
                        id="activeDebts"
                        type="number"
                        value={formData.limits.activeDebts}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, activeDebts: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="recurringTransactions" className="font-bold text-sm">Trans. Recurrentes</Label>
                      <Input
                        id="recurringTransactions"
                        type="number"
                        value={formData.limits.recurringTransactions}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, recurringTransactions: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="categories" className="font-bold text-sm">Categorías</Label>
                      <Input
                        id="categories"
                        type="number"
                        value={formData.limits.categories}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, categories: parseInt(e.target.value) || 0 }
                        }))}
                        className="border-2 border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-bold uppercase mb-4">Características del Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="border-2 border-black"
                        />
                        <Label htmlFor={feature} className="text-sm">
                          {feature.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div>
                  <Label htmlFor="order" className="font-bold uppercase">Orden de Visualización</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="border-2 border-black w-32"
                    placeholder="1"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleCreatePlan}
                    className="brutal-button brutal-button--primary flex-1"
                    disabled={!formData.name || !formData.displayName}
                  >
                    Crear Plan
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