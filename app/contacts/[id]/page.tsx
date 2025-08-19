"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency, toCurrency } from "@/lib/currency";
import EditContactModal from "@/components/forms/EditContactModal";
import DeleteContactModal from "@/components/forms/DeleteContactModal";

// Helper function to format dates
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

interface Debt {
  _id: string;
  type: 'owes_me' | 'i_owe';
  originalAmount: number;
  currentAmount: number;
  description: string;
  counterpartyName: string;
  counterpartyContact?: string;
  startDate: number;
  dueDate?: number;
  status: 'open' | 'paid' | 'overdue' | 'partially_paid';
  interestRate?: number;
  notes?: string;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const user = useQuery(api.users.getCurrentUser);
  const contact = useQuery(
    api.contacts.getContact,
    user?._id && contactId ? {
      userId: user._id,
      contactId: contactId as Id<"contacts">
    } : "skip"
  );
  
  const contactDebts = useQuery(
    api.contacts.getContactDebts,
    user?._id && contact ? {
      userId: user._id,
      contactName: contact.name
    } : "skip"
  );

  const userCurrency = toCurrency(user?.currency || 'USD');

  const debtSummary = useMemo(() => {
    if (!contactDebts) return { totalOwedToMe: 0, totalIOwe: 0, netBalance: 0 };
    
    return contactDebts.reduce((acc: { totalOwedToMe: number; totalIOwe: number; netBalance: number }, debt: Debt) => {
      if (debt.status === 'open' || debt.status === 'partially_paid' || debt.status === 'overdue') {
        if (debt.type === 'owes_me') {
          acc.totalOwedToMe += debt.currentAmount;
        } else {
          acc.totalIOwe += debt.currentAmount;
        }
      }
      return acc;
    }, { totalOwedToMe: 0, totalIOwe: 0, netBalance: 0 });
  }, [contactDebts]);

  debtSummary.netBalance = debtSummary.totalOwedToMe - debtSummary.totalIOwe;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Abierta';
      case 'paid': return 'Pagada';
      case 'overdue': return 'Vencida';
      case 'partially_paid': return 'Parcial';
      default: return status;
    }
  };

  const getDebtTypeText = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'Me Debe' : 'Le Debo';
  };

  const getDebtTypeColor = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'text-green-600' : 'text-red-600';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!contact) {
    return (
      <div className="px-6 py-8">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Cargando contacto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => router.back()}
            className="brutal-button p-3"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black">
              {contact.name}
            </h1>
            <p className="text-gray-600 font-medium">
              Detalles del contacto y balance de deudas
            </p>
          </div>
        </div>
        <div className="w-20 h-1 bg-black"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="brutal-card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                {contact.avatar ? (
                  <Image src={contact.avatar} alt={contact.name} width={80} height={80} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(contact.name)
                )}
              </div>
              <h2 className="text-2xl font-black mb-2">{contact.name}</h2>
              <p className="text-gray-600 text-sm font-medium">
                Contacto desde {formatDate(contact.createdAt)}
              </p>
            </div>

            <div className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{contact.email}</span>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{contact.phone}</span>
                </div>
              )}
              
              {contact.address && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{contact.address}</span>
                </div>
              )}
              
              {contact.notes && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <h3 className="font-black text-sm uppercase tracking-wide mb-2">Notas</h3>
                  <p className="text-gray-600 text-sm">{contact.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="brutal-button flex-1 hover:bg-blue-500 hover:text-white"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                className="brutal-button hover:bg-red-500 hover:text-white"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Debt Summary & List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Balance Summary */}
          <Card className="brutal-card p-6">
            <h3 className="text-xl font-black uppercase tracking-wide mb-4">Balance de Deudas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded">
                <p className="text-sm font-black uppercase tracking-wide text-green-600 mb-1">Me Debe</p>
                <p className="text-2xl font-black text-green-600">
                  {formatCurrency(debtSummary.totalOwedToMe, userCurrency)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 border-2 border-red-200 rounded">
                <p className="text-sm font-black uppercase tracking-wide text-red-600 mb-1">Le Debo</p>
                <p className="text-2xl font-black text-red-600">
                  {formatCurrency(debtSummary.totalIOwe, userCurrency)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 border-2 border-gray-200 rounded">
                <p className="text-sm font-black uppercase tracking-wide text-gray-600 mb-1">Balance Neto</p>
                <p className={`text-2xl font-black ${
                  debtSummary.netBalance > 0 ? 'text-green-600' : 
                  debtSummary.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatCurrency(Math.abs(debtSummary.netBalance), userCurrency)}
                </p>
                {debtSummary.netBalance !== 0 && (
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    {debtSummary.netBalance > 0 ? 'A mi favor' : 'En mi contra'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Debts List */}
          <Card className="brutal-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black uppercase tracking-wide">Historial de Deudas</h3>
              <Button className="brutal-button">
                <PlusIcon className="w-4 h-4 mr-2" />
                Nueva Deuda
              </Button>
            </div>
            
            {!contactDebts || contactDebts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-medium">
                  No hay deudas registradas con este contacto
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactDebts.map((debt: Debt, index: number) => (
                  <motion.div
                    key={debt._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 border-2 border-gray-200 rounded hover:shadow-brutal transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-black text-lg ${getDebtTypeColor(debt.type)}`}>
                            {getDebtTypeText(debt.type)}
                          </span>
                          <Badge className={`${getStatusColor(debt.status)}`}>
                            {getStatusText(debt.status)}
                          </Badge>
                        </div>
                        
                        <h4 className="text-lg font-black mb-2">{debt.description}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {formatCurrency(debt.currentAmount, userCurrency)}
                              {debt.originalAmount !== debt.currentAmount && (
                                <span className="text-gray-400 ml-1">
                                  (de {formatCurrency(debt.originalAmount, userCurrency)})
                                </span>
                              )}
                            </span>
                          </div>
                          
                          {debt.dueDate && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                Vence: {formatDate(debt.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {debt.notes && (
                          <p className="text-sm text-gray-600 mt-2">{debt.notes}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button className="brutal-button p-3 hover:bg-blue-500 hover:text-white">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contact={contact}
      />
      
      <DeleteContactModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        contact={contact}
      />
    </div>
  );
}