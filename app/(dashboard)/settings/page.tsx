"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 font-medium">
          Personaliza tu experiencia en Finance Tracker
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Settings Sections */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Preferencias Generales
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium">
              Configuraciones generales próximamente
            </p>
          </div>
        </Card>

        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Notificaciones
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium">
              Configuración de notificaciones próximamente
            </p>
          </div>
        </Card>

        <Card className="brutal-card p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-black uppercase tracking-wide">
              Seguridad
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium">
              Configuraciones de seguridad próximamente
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}