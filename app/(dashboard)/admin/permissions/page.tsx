"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
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
import { Textarea } from "@/components/ui/textarea";

// Mock data - En producción esto vendría de queries de Convex
const mockRoles = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acceso completo a gestión de usuarios y configuración",
    permissions: ["manage_users", "view_users", "manage_plans", "view_plans"],
    userCount: 3,
    isSystem: false
  },
  {
    id: "super_admin", 
    name: "Super Administrador",
    description: "Acceso completo a todas las funciones del sistema",
    permissions: ["*"], // All permissions
    userCount: 1,
    isSystem: true
  },
  {
    id: "moderator",
    name: "Moderador",
    description: "Acceso limitado para moderación de contenido",
    permissions: ["view_users", "view_analytics"],
    userCount: 0,
    isSystem: false
  }
];

const mockPermissions = [
  {
    name: "manage_users",
    displayName: "Gestionar Usuarios",
    description: "Crear, editar y eliminar usuarios del sistema",
    category: "users"
  },
  {
    name: "view_users", 
    displayName: "Ver Usuarios",
    description: "Visualizar lista de usuarios y sus datos",
    category: "users"
  },
  {
    name: "manage_plans",
    displayName: "Gestionar Planes",
    description: "Crear, editar y eliminar planes de suscripción",
    category: "billing"
  },
  {
    name: "view_plans",
    displayName: "Ver Planes",
    description: "Visualizar planes de suscripción disponibles",
    category: "billing"
  },
  {
    name: "view_analytics",
    displayName: "Ver Analíticas",
    description: "Acceder a métricas y estadísticas del sistema",
    category: "analytics"
  },
  {
    name: "manage_system_settings",
    displayName: "Gestionar Configuración",
    description: "Modificar configuraciones globales del sistema",
    category: "system"
  }
];

export default function AdminPermissionsPage() {
  const { canAssignPermissions, canViewUsers } = useAdmin();
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  if (!canViewUsers) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para gestionar permisos del sistema.</p>
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
            <ShieldCheckIcon className="w-8 h-8" />
            Permisos del Sistema
          </h1>
          <p className="text-gray-600 font-medium">
            Gestionar roles, permisos y accesos administrativos
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 border-2 border-black p-1 bg-white w-fit">
            <Button
              onClick={() => setActiveTab("roles")}
              className={`brutal-button ${
                activeTab === "roles" 
                  ? "bg-black text-white" 
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Roles
            </Button>
            <Button
              onClick={() => setActiveTab("permissions")}
              className={`brutal-button ${
                activeTab === "permissions"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <KeyIcon className="w-4 h-4 mr-2" />
              Permisos
            </Button>
          </div>
        </div>

        {activeTab === "roles" && (
          <div>
            {/* Roles Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-2 border-black bg-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-black">{mockRoles.length}</div>
                  <div className="text-sm font-bold uppercase text-gray-600">Total Roles</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-black bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-black text-blue-700">
                    {mockRoles.reduce((sum, role) => sum + role.userCount, 0)}
                  </div>
                  <div className="text-sm font-bold uppercase text-blue-600">Usuarios con Roles</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-black bg-purple-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-black text-purple-700">
                    {mockRoles.filter(r => !r.isSystem).length}
                  </div>
                  <div className="text-sm font-bold uppercase text-purple-600">Roles Personalizados</div>
                </CardContent>
              </Card>
            </div>

            {/* Create Role Button */}
            {canAssignPermissions && (
              <div className="mb-6">
                <Button className="brutal-button brutal-button--primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Crear Nuevo Rol
                </Button>
              </div>
            )}

            {/* Roles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRoles.map((role) => (
                <Card key={role.id} className="border-4 border-black shadow-brutal">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-black uppercase">
                        {role.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {role.isSystem && (
                          <Badge className="bg-red-500 text-white border border-black text-xs">
                            SISTEMA
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-black text-xs">
                          {role.userCount} usuarios
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Permissions */}
                    <div>
                      <h4 className="font-bold text-sm uppercase mb-2">Permisos:</h4>
                      {role.permissions.includes("*") ? (
                        <Badge className="bg-yellow-500 text-black border border-black">
                          TODOS LOS PERMISOS
                        </Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-black">
                              {permission.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs border-black">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canAssignPermissions && !role.isSystem && (
                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          className="brutal-button bg-blue-500 hover:bg-blue-600 text-white flex-1"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="brutal-button bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => {
                            if (confirm(`¿Eliminar el rol "${role.name}"?`)) {
                              console.log("Delete role:", role.id);
                            }
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "permissions" && (
          <div>
            {/* Permissions Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-2 border-black bg-white">
                <CardContent className="p-4">
                  <div className="text-2xl font-black">{mockPermissions.length}</div>
                  <div className="text-sm font-bold uppercase text-gray-600">Total Permisos</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-black bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-black text-green-700">
                    {new Set(mockPermissions.map(p => p.category)).size}
                  </div>
                  <div className="text-sm font-bold uppercase text-green-600">Categorías</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-black bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-black text-blue-700">
                    {mockPermissions.filter(p => p.category === "users").length}
                  </div>
                  <div className="text-sm font-bold uppercase text-blue-600">Usuarios</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-black bg-yellow-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-black text-yellow-700">
                    {mockPermissions.filter(p => p.category === "billing").length}
                  </div>
                  <div className="text-sm font-bold uppercase text-yellow-600">Facturación</div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions by Category */}
            {["users", "billing", "analytics", "system"].map((category) => {
              const categoryPermissions = mockPermissions.filter(p => p.category === category);
              if (categoryPermissions.length === 0) return null;

              return (
                <Card key={category} className="border-4 border-black shadow-brutal mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-black uppercase">
                      {category === "users" && "👥 Gestión de Usuarios"}
                      {category === "billing" && "💳 Facturación"}
                      {category === "analytics" && "📊 Analíticas"}
                      {category === "system" && "⚙️ Sistema"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryPermissions.map((permission) => (
                        <div 
                          key={permission.name}
                          className="border-2 border-gray-300 p-4 bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sm">{permission.displayName}</h4>
                            <Badge variant="outline" className="border-black text-xs">
                              {permission.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {permission.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}