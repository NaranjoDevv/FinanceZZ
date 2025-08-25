"use client";

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrutalButton, BrutalBadge } from '@/components/brutal';
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { BrutalInput } from '@/components/ui/brutal-input';
import { BrutalSelect } from '@/components/ui/brutal-select';

interface User {
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

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserView?: (user: User) => void;
  onUserCreate?: () => void;
  className?: string;
}

type SortField = 'name' | 'email' | 'role' | 'status' | 'lastLogin' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const ROLE_COLORS = {
  admin: 'danger',
  moderator: 'warning',
  user: 'default'
} as const;

const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  suspended: 'danger'
} as const;

const ROLE_LABELS = {
  admin: 'ADMIN',
  moderator: 'MOD',
  user: 'USER'
};

const STATUS_LABELS = {
  active: 'ACTIVO',
  inactive: 'INACTIVO',
  suspended: 'SUSPENDIDO'
};

export const UsersTable = memo<UsersTableProps>(({ 
  users, 
  isLoading = false,
  onUserEdit,
  onUserDelete,
  onUserView,
  onUserCreate,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filtrar y ordenar usuarios
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredAndSortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredAndSortedUsers.map(user => user._id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUpDownIcon className="w-4 h-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4" /> : 
      <ChevronDownIcon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className={cn(
        'bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6',
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 border-2 border-black"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-2 border-black"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b-4 border-black">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400 border-4 border-black">
              <UserIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-black">
                GESTIÓN DE USUARIOS
              </h2>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {filteredAndSortedUsers.length} de {users.length} usuarios
              </p>
            </div>
          </div>
          
          {onUserCreate && (
            <BrutalButton
              variant="primary"
              onClick={onUserCreate}
              className="flex items-center gap-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              NUEVO USUARIO
            </BrutalButton>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BrutalInput
            label=""
            icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <BrutalSelect
            label=""
            icon={<FunnelIcon className="w-4 h-4" />}
            placeholder="Filtrar por rol"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: 'Todos los roles' },
              { value: 'admin', label: 'Administradores' },
              { value: 'moderator', label: 'Moderadores' },
              { value: 'user', label: 'Usuarios' }
            ]}
          />
          
          <BrutalSelect
            label=""
            icon={<FunnelIcon className="w-4 h-4" />}
            placeholder="Filtrar por estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
              { value: 'suspended', label: 'Suspendidos' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-4 border-black">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 border-2 border-black"
                />
              </th>
              
              <th 
                className="p-4 text-left font-black uppercase tracking-wider text-black cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  USUARIO
                  <SortIcon field="name" />
                </div>
              </th>
              
              <th 
                className="p-4 text-left font-black uppercase tracking-wider text-black cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-2">
                  ROL
                  <SortIcon field="role" />
                </div>
              </th>
              
              <th 
                className="p-4 text-left font-black uppercase tracking-wider text-black cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  ESTADO
                  <SortIcon field="status" />
                </div>
              </th>
              
              <th 
                className="p-4 text-left font-black uppercase tracking-wider text-black cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lastLogin')}
              >
                <div className="flex items-center gap-2">
                  ÚLTIMO ACCESO
                  <SortIcon field="lastLogin" />
                </div>
              </th>
              
              <th className="p-4 text-left font-black uppercase tracking-wider text-black">
                ACCIONES
              </th>
            </tr>
          </thead>
          
          <tbody>
            <AnimatePresence>
              {filteredAndSortedUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className={cn(
                    'border-b-2 border-gray-200 hover:bg-gray-50 transition-colors',
                    selectedUsers.has(user._id) && 'bg-yellow-50'
                  )}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="w-4 h-4 border-2 border-black"
                    />
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 border-2 border-black flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-black">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <BrutalBadge variant={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </BrutalBadge>
                  </td>
                  
                  <td className="p-4">
                    <BrutalBadge variant={STATUS_COLORS[user.status]}>
                      {STATUS_LABELS[user.status]}
                    </BrutalBadge>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {onUserView && (
                        <BrutalButton
                          variant="secondary"
                          size="sm"
                          onClick={() => onUserView(user)}
                          className="p-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </BrutalButton>
                      )}
                      
                      {onUserEdit && (
                        <BrutalButton
                          variant="secondary"
                          size="sm"
                          onClick={() => onUserEdit(user)}
                          className="p-2"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </BrutalButton>
                      )}
                      
                      {onUserDelete && (
                        <BrutalButton
                          variant="danger"
                          size="sm"
                          onClick={() => onUserDelete(user)}
                          className="p-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </BrutalButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedUsers.length === 0 && (
        <div className="p-12 text-center border-t-4 border-black">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 border-4 border-black">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black mb-2">
                NO SE ENCONTRARON USUARIOS
              </h3>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay usuarios registrados en el sistema'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {selectedUsers.size > 0 && (
        <div className="p-4 bg-yellow-50 border-t-4 border-black">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-black uppercase tracking-wide">
              {selectedUsers.size} usuario(s) seleccionado(s)
            </span>
            <div className="flex items-center gap-2">
              <BrutalButton
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUsers(new Set())}
              >
                LIMPIAR SELECCIÓN
              </BrutalButton>
              <BrutalButton
                variant="danger"
                size="sm"
                onClick={() => {
                  // Implementar acción masiva
                  console.log('Bulk action for:', Array.from(selectedUsers));
                }}
              >
                ACCIÓN MASIVA
              </BrutalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

UsersTable.displayName = 'UsersTable';

export default UsersTable;