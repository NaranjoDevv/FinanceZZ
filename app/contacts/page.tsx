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
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const contacts = useMemo(() => {
    return contactsData || [];
  }, [contactsData]);

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];

    return contacts.filter((contact: Contact) => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm);

      if (filterType === "all") return matchesSearch;
      if (filterType === "with-email") return matchesSearch && contact.email;
      if (filterType === "with-phone") return matchesSearch && contact.phone;
      return matchesSearch;
    });
  }, [contacts, searchTerm, filterType]);

  const stats = useMemo(() => {
    if (!contacts) return { total: 0, withEmail: 0, withPhone: 0, recent: 0 };

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    return {
      total: contacts.length,
      withEmail: contacts.filter(c => c.email).length,
      withPhone: contacts.filter(c => c.phone).length,
      recent: contacts.filter(c => c.createdAt > oneWeekAgo).length
    };
  }, [contacts]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };



  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleDeleteContact = (contact: Contact) => {
    setDeletingContact(contact);
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pt-6"
        >
          <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
            Contactos
          </h1>
          <p className="text-gray-600 font-medium transition-colors duration-200">
            Gestiona tu red de contactos y mantén el control de tus relaciones financieras
          </p>
          <div className="w-20 h-1 bg-black mt-4"></div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <Button
              className="brutal-button brutal-button--primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Contacto
            </Button>
            <Button 
              className={`brutal-button ${showFilters ? 'bg-black text-white' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Filtros
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="brutal-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 text-white rounded-none">
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                  Total Contactos
                </h3>
                <p className="text-2xl font-black text-blue-600 transition-colors duration-200">
                  {stats.total}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="brutal-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 text-white rounded-none">
                    <EnvelopeIcon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                  Con Email
                </h3>
                <p className="text-2xl font-black text-green-600 transition-colors duration-200">
                  {stats.withEmail}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="brutal-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 text-white rounded-none">
                    <PhoneIcon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                  Con Teléfono
                </h3>
                <p className="text-2xl font-black text-purple-600 transition-colors duration-200">
                  {stats.withPhone}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="brutal-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500 text-white rounded-none">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                  Recientes
                </h3>
                <p className="text-2xl font-black text-orange-600 transition-colors duration-200">
                  {stats.recent}
                </p>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Controls */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ 
                duration: 0.4,
                ease: "easeInOut",
                height: { delay: 0.1, duration: 0.3 }
              }}
              className="mb-8"
            >
              <Card className="brutal-card p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar contactos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="with-email">Con Email</SelectItem>
                          <SelectItem value="with-phone">Con Teléfono</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contacts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="brutal-card">
            <div className="p-6 border-b-4 border-black">
              <h2 className="text-xl font-black uppercase tracking-wide">
                Lista de Contactos ({filteredContacts.length})
              </h2>
            </div>
            
            {!contacts ? (
              <div className="p-6 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando contactos...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? "No se encontraron contactos" : "No tienes contactos aún"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="brutal-button brutal-button--primary mt-4"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Crear tu primer contacto
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y-4 divide-black">
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="relative flex items-center justify-between p-4 border-2 transition-all duration-200 group border-gray-200 hover:border-black"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 rounded-none bg-blue-500 text-white">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm uppercase tracking-wide">
                            {contact.name}
                          </h4>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600 font-medium">
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <EnvelopeIcon className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                          {contact.address && (
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-3 w-3" />
                              <span className="truncate">{contact.address}</span>
                            </div>
                          )}
                        </div>
                        {contact.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">
                          {formatDate(contact.createdAt)}
                        </p>
                      </div>

                      {/* Action Buttons - Show on hover */}
                      <div className="flex gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                        <motion.button
                          onClick={() => handleEditContact(contact)}
                          className="brutal-button p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Editar contacto"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteContact(contact)}
                          className="brutal-button p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Eliminar contacto"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

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
    </div>
  );
}