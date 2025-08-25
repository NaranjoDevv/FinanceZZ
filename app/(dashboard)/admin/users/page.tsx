"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { 
  UsersIcon
} from "@heroicons/react/24/outline";
import { UsersTable } from "@/components/admin/UsersTable";
import { UserModal, User as ModalUser } from "@/components/admin/UserModal";
import { Id } from "@/convex/_generated/dataModel";

interface AdminUser {
  _id: Id<"users">;
  name: string;
  email: string;
  plan: "free" | "premium" | "admin";
  role?: "user" | "admin" | "super_admin";
  isActive?: boolean;
  createdAt?: number;
  lastLoginAt?: number;
}

interface TableUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  totalTransactions?: number;
  totalAmount?: number;
}

export default function AdminUsersPage() {
  const { allUsers, isLoading } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert admin users to the format expected by UsersTable
  const convertedUsers: TableUser[] = allUsers?.page?.map((user: AdminUser) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: (user.role || 'user') as 'admin' | 'user' | 'moderator',
    status: (user.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive' | 'suspended',
    ...(user.lastLoginAt && { lastLogin: new Date(user.lastLoginAt).toISOString() }),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    totalTransactions: 0, // TODO: Get from real data
    totalAmount: 0 // TODO: Get from real data
  })) || [];

  const handleUserEdit = (user: TableUser) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleUserDelete = async (user: TableUser) => {
    // TODO: Implement user deletion
    console.log('Delete user:', user);
  };

  const handleUserView = (user: TableUser) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleUserCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleUserSave = async (userData: ModalUser) => {
    try {
      if (modalMode === 'create') {
        // TODO: Implement user creation
        console.log('Create user:', userData);
      } else if (modalMode === 'edit') {
        // TODO: Implement user update  
        console.log('Update user:', userData);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white border-8 border-yellow-400 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-12 h-12 border-8 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-wider text-black mb-4">
            CARGANDO USUARIOS
          </h2>
          <p className="text-sm font-bold uppercase text-gray-600">
            OBTENIENDO DATOS DEL SERVIDOR...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* BRUTAL HEADER - RESPONSIVE */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-wider mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            <div className="p-2 lg:p-3 bg-blue-500 border-4 border-black flex-shrink-0">
              <UsersIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <span className="leading-tight">GESTIÓN BRUTAL DE USUARIOS</span>
          </h1>
          <p className="text-sm lg:text-lg font-bold text-gray-700 uppercase">
            DOMINA COMPLETAMENTE EL SISTEMA DE USUARIOS
          </p>
          <div className="w-full h-2 bg-black mt-4"></div>
        </div>

        {/* BRUTAL USERS TABLE */}
        <UsersTable
          users={convertedUsers}
          isLoading={isLoading}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
          onUserView={handleUserView}
          onUserCreate={handleUserCreate}
        />

        {/* USER MODAL */}
        <UserModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleUserSave}
          user={selectedUser}
          mode={modalMode}
          isLoading={false}
        />
      </div>
    </div>
  );
}