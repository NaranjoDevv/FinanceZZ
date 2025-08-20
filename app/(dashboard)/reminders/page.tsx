"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BellIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import CreateReminderModal from "@/components/forms/CreateReminderModal";
import EditReminderModal from "@/components/forms/EditReminderModal";
import DeleteReminderModal from "@/components/forms/DeleteReminderModal";
import { Id } from "@/convex/_generated/dataModel";

interface Reminder {
  _id: Id<"reminders">;
  title: string;
  description?: string;
  dueDate: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "cancelled";
  category: "debt" | "payment" | "meeting" | "task" | "other";
  relatedDebtId?: Id<"debts">;
  relatedContactId?: Id<"contacts">;
  isRecurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: number;
  updatedAt: number;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "URGENTE";
      case "high":
        return "ALTA";
      case "medium":
        return "MEDIA";
      case "low":
        return "BAJA";
      default:
        return "NORMAL";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "trabajo":
        return "💼";
      case "personal":
        return "👤";
      case "salud":
        return "🏥";
      case "finanzas":
        return "💰";
      case "educación":
        return "📚";
      case "hogar":
        return "🏠";
      default:
        return "📋";
    }
  };

  const isOverdue = (dueDate: number) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setReminders([
        {
          _id: "1" as Id<"reminders">,
          title: "Reunión con el equipo",
          description: "Revisar el progreso del proyecto Q4",
          dueDate: new Date("2024-01-15T10:00:00Z").getTime(),
          priority: "high",
          category: "meeting",
          status: "pending",
          isRecurring: false,
          createdAt: new Date("2024-01-01T00:00:00Z").getTime(),
          updatedAt: new Date("2024-01-01T00:00:00Z").getTime(),
        },
        {
          _id: "2" as Id<"reminders">,
          title: "Cita médica",
          description: "Chequeo anual",
          dueDate: new Date("2024-01-20T14:30:00Z").getTime(),
          priority: "medium",
          category: "other",
          status: "pending",
          isRecurring: true,
          recurringFrequency: "yearly",
          createdAt: new Date("2024-01-01T00:00:00Z").getTime(),
          updatedAt: new Date("2024-01-01T00:00:00Z").getTime(),
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || reminder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || reminder.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === "pending").length,
    completed: reminders.filter(r => r.status === "completed").length,
    overdue: reminders.filter(r => r.status === "pending" && isOverdue(r.dueDate)).length,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recordatorios</h1>
            <p className="text-gray-600 mt-1">Gestiona tus recordatorios y tareas importantes</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="brutal-card hover:shadow-brutal-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total
                </CardTitle>
                <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger>
                       <BellIcon className="h-4 w-4 text-blue-600" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Total de recordatorios</p>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="brutal-card hover:shadow-brutal-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pendientes
                </CardTitle>
                <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger>
                       <ClockIcon className="h-4 w-4 text-orange-600" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Recordatorios pendientes</p>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="brutal-card hover:shadow-brutal-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completados
                </CardTitle>
                <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger>
                       <CheckCircleIcon className="h-4 w-4 text-green-600" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Recordatorios completados</p>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="brutal-card hover:shadow-brutal-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Vencidos
                </CardTitle>
                <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger>
                       <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                     </TooltipTrigger>
                     <TooltipContent>
                       <p>Recordatorios vencidos</p>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="brutal-button bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Recordatorio
          </Button>

          <div className="flex gap-4 w-full sm:w-auto items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`brutal-button transition-all duration-300 ${
                showFilters 
                  ? 'bg-blue-500 text-white shadow-brutal-lg scale-105' 
                  : 'hover:shadow-brutal-md hover:scale-105'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <div className="relative flex-1 sm:flex-none">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar recordatorios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="brutal-input pl-10 w-full sm:w-80"
              />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="flex gap-4 p-4 bg-white rounded-lg border-2 border-black shadow-brutal"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeInOut",
                height: { delay: 0.1, duration: 0.3 }
              }}
            >
            <div className="flex gap-4 items-center flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "pending" | "completed" | "cancelled")}>
                <SelectTrigger className="brutal-select w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="brutal-select w-48">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminders List */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando recordatorios...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <Card className="brutal-card">
              <CardContent className="text-center py-8">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? "No se encontraron recordatorios" : "No tienes recordatorios aún"}
                </p>
                {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="brutal-button bg-blue-500 hover:bg-blue-600 text-white mt-4"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Crear tu primer recordatorio
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReminders.map((reminder: Reminder, index) => {
                const overdueStatus = isOverdue(reminder.dueDate) && reminder.status === "pending";

                return (
                  <motion.div
                    key={reminder._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className={`brutal-card hover:shadow-brutal-lg transition-all duration-300 ${
                      reminder.status === "completed" ? "opacity-75" : ""
                    } ${
                      overdueStatus ? "border-l-4 border-l-red-500" : ""
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="text-2xl mt-1">
                              {getCategoryIcon(reminder.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className={`text-lg font-bold ${
                                  reminder.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                                }`}>
                                  {reminder.title}
                                </h3>
                                <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getPriorityColor(reminder.priority)}`}>
                                  {getPriorityText(reminder.priority)}
                                </div>
                                {reminder.status === "completed" && (
                                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                )}
                                {overdueStatus && (
                                  <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">
                                    VENCIDO
                                  </span>
                                )}
                              </div>
                              
                              {reminder.description && (
                                <p className={`text-sm mb-3 ${
                                  reminder.status === "completed" ? "text-gray-400" : "text-gray-600"
                                }`}>
                                  {reminder.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span className={overdueStatus ? "text-red-600 font-bold" : ""}>
                                    {formatDate(reminder.dueDate)}
                                  </span>
                                </div>
                                {reminder.isRecurring && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                    Recurrente ({reminder.recurringFrequency})
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  reminder.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                  reminder.status === "completed" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {reminder.status === "pending" ? "Pendiente" :
                                   reminder.status === "completed" ? "Completado" : "Cancelado"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingReminder(reminder)}
                              className="brutal-button text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingReminder(reminder)}
                              className="brutal-button text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateReminderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingReminder && (
        <EditReminderModal
          isOpen={!!editingReminder}
          onClose={() => setEditingReminder(null)}
          reminder={editingReminder}
        />
      )}

      {deletingReminder && (
        <DeleteReminderModal
          isOpen={!!deletingReminder}
          onClose={() => setDeletingReminder(null)}
          reminder={deletingReminder}
        />
      )}
    </div>
  );
}