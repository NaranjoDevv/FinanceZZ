"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

export default function ReportsPage() {
  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
          Reportes
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Analiza tus finanzas con reportes detallados
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
          <Button className="brutal-button brutal-button--primary">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Generar Reporte
          </Button>
          <Button className="brutal-button">
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Exportar
          </Button>
          <Button className="brutal-button">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Período
          </Button>
        </div>
      </motion.div>

      {/* Reports Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="brutal-card p-6">
          <h2 className="text-xl font-black uppercase tracking-wide mb-4 text-black transition-colors duration-200">
            Reportes Financieros
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium transition-colors duration-200">
              La funcionalidad de reportes se implementará próximamente
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}