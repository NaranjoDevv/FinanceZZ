"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import CreateContactModal from "@/components/forms/CreateContactModal";
import EditContactModal from "@/components/forms/EditContactModal";
import DeleteContactModal from "@/components/forms/DeleteContactModal";
import { Id } from "@/convex/_generated/dataModel";

interface Contact {
  _id: Id<"contacts">;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const currentUser = useQuery(api.users.getCurrentUser);
  const contactsData = useQuery(
    api.contacts.getContacts,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const contacts = contactsData || [];

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone?.includes(searchTerm)
      );
    }

    if (filterType !== "all") {
      switch (filterType) {
        case "with-email":
          filtered = filtered.filter((contact) => contact.email);
          break;
        case "with-phone":
          filtered = filtered.filter((contact) => contact.phone);
          break;
        case "with-address":
          filtered = filtered.filter((contact) => contact.address);
          break;
      }
    }

    return filtered;
  }, [contacts, searchTerm, filterType]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-black text-yellow-400 rounded-lg">
              <UserGroupIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-black">
                CONTACTOS
              </h1>
              <p className="text-lg text-gray-600 font-bold">
                Gestiona tu red de contactos
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-4 border-black bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600">TOTAL</p>
                  <p className="text-2xl font-black text-black">{contacts.length}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4 border-4 border-black bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600">CON EMAIL</p>
                  <p className="text-2xl font-black text-black">
                    {contacts.filter(c => c.email).length}
                  </p>
                </div>
                <EnvelopeIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4 border-4 border-black bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600">CON TELÉFONO</p>
                  <p className="text-2xl font-black text-black">
                    {contacts.filter(c => c.phone).length}
                  </p>
                </div>
                <PhoneIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4 border-4 border-black bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600">CON DIRECCIÓN</p>
                  <p className="text-2xl font-black text-black">
                    {contacts.filter(c => c.address).length}
                  </p>
                </div>
                <MapPinIcon className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-4 border-black rounded-lg font-bold text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400"
                />
              </div>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-4 border-black font-black text-black hover:bg-yellow-400 hover:text-black transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                FILTROS
              </Button>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-black text-yellow-400 border-4 border-black font-black hover:bg-yellow-400 hover:text-black transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              NUEVO CONTACTO
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-white border-4 border-black rounded-lg"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">TIPO</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48 border-2 border-black font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="with-email">Con Email</SelectItem>
                        <SelectItem value="with-phone">Con Teléfono</SelectItem>
                        <SelectItem value="with-address">Con Dirección</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <Card className="p-12 border-4 border-black bg-white text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-black mb-2">
              {searchTerm || filterType !== "all" ? "NO SE ENCONTRARON CONTACTOS" : "NO HAY CONTACTOS"}
            </h3>
            <p className="text-gray-600 font-bold mb-6">
              {searchTerm || filterType !== "all" 
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza agregando tu primer contacto"
              }
            </p>
            {!searchTerm && filterType === "all" && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-black text-yellow-400 border-4 border-black font-black hover:bg-yellow-400 hover:text-black transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                CREAR PRIMER CONTACTO
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 border-4 border-black bg-white hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-lg">
                        {contact.avatar ? (
                          <img 
                            src={contact.avatar} 
                            alt={contact.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          getInitials(contact.name)
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-black">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-bold flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(contact.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingContact(contact)}
                        size="sm"
                        variant="outline"
                        className="border-2 border-black font-bold hover:bg-yellow-400 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setDeletingContact(contact)}
                        size="sm"
                        variant="outline"
                        className="border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-gray-700">{contact.email}</span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-bold text-gray-700">{contact.phone}</span>
                      </div>
                    )}
                    
                    {contact.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-gray-700">{contact.address}</span>
                      </div>
                    )}
                    
                    {contact.notes && (
                      <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                        <p className="text-sm font-bold text-gray-600">{contact.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      {editingContact && (
        <EditContactModal
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          contact={editingContact}
        />
      )}
      
      {deletingContact && (
        <DeleteContactModal
          isOpen={!!deletingContact}
          onClose={() => setDeletingContact(null)}
          contact={deletingContact}
        />
      )}
    </div>
  );
}