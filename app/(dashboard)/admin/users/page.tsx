"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  ShieldCheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  plan: "free" | "premium" | "admin";
  role?: "user" | "admin" | "super_admin";
  isActive?: boolean;
  createdAt?: number;
  lastLoginAt?: number;
}

export default function AdminUsersPage() {
  const { allUsers, currentAdminUser, canEditUserRoles, promoteUserToAdmin } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const filteredUsers = allUsers?.page?.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePromoteUser = async (userId: Id<"users">, role: "admin" | "super_admin") => {
    try {
      await promoteUserToAdmin(userId, role);
      setIsPromoteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error promoting user:", error);
    }
  };

  const getRoleBadgeColor = (role?: string, plan?: string) => {
    if (role === "super_admin") return "bg-red-500";
    if (role === "admin" || plan === "admin") return "bg-purple-500";
    if (plan === "premium") return "bg-green-500";
    return "bg-gray-500";
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('es-ES');
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2 flex items-center gap-3">
            <UsersIcon className="w-8 h-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 font-medium">
            Administrar usuarios del sistema, roles y permisos
          </p>
          <div className="w-full h-1 bg-black mt-4"></div>
        </div>

        {/* Search and Filters */}
        <Card className="border-4 border-black shadow-brutal mb-6">
          <CardHeader>
            <CardTitle>Buscar Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-black"
                />
              </div>
              <Button className="brutal-button brutal-button--primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Invitar Usuario
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-4 border-black shadow-brutal">
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              Total de usuarios: {filteredUsers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left p-4 font-black uppercase">Usuario</th>
                    <th className="text-left p-4 font-black uppercase">Plan</th>
                    <th className="text-left p-4 font-black uppercase">Rol</th>
                    <th className="text-left p-4 font-black uppercase">Estado</th>
                    <th className="text-left p-4 font-black uppercase">Registro</th>
                    <th className="text-left p-4 font-black uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: User, index: number) => (
                    <tr key={user._id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="p-4">
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getRoleBadgeColor(user.role, user.plan)} text-white border border-black`}>
                          {user.plan.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="outline" 
                          className="border-black"
                        >
                          {user.role ? user.role.toUpperCase() : "USER"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border border-black ${
                            user.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">
                            {user.isActive !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="brutal-button brutal-button--secondary"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          {canEditUserRoles && user._id !== currentAdminUser?._id && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPromoteModalOpen(true);
                              }}
                              className="brutal-button bg-purple-500 hover:bg-purple-600 text-white border-black"
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Promote User Modal */}
        {isPromoteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="border-4 border-black shadow-brutal bg-white w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    Promover Usuario
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsPromoteModalOpen(false);
                      setSelectedUser(null);
                    }}
                    className="border-2 border-black"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  ¿Deseas promover a {selectedUser.name} a administrador?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => handlePromoteUser(selectedUser._id, "admin")}
                    className="w-full brutal-button bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Promover a Administrador
                  </Button>
                  
                  {currentAdminUser?.role === "super_admin" && (
                    <Button
                      onClick={() => handlePromoteUser(selectedUser._id, "super_admin")}
                      className="w-full brutal-button bg-red-500 hover:bg-red-600 text-white"
                    >
                      Promover a Super Administrador
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      setIsPromoteModalOpen(false);
                      setSelectedUser(null);
                    }}
                    className="w-full brutal-button brutal-button--secondary"
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