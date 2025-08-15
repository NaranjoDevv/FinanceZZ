"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AuthModal({ isOpen, onClose, title, children }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="brutal-card p-0 border-4 border-black shadow-brutal max-w-md w-full overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            className="relative"
            initial={{ opacity: 0, scale: 0.95, height: 'auto' }}
            animate={{
              opacity: 1,
              scale: 1,
              height: 'auto',
              transition: {
                duration: 0.3,
                ease: "easeOut",
                height: { duration: 0.4, ease: "easeInOut" }
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.2, ease: "easeIn" }
            }}
            layout
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-6 border-b-4 border-black bg-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <h2 className="text-xl font-black uppercase tracking-wider">
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                className="brutal-button p-2 hover:bg-black hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              className="w-full h-1 bg-black"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />

            {/* Content with consistent min-height */}
            <motion.div
              className="p-6 bg-white min-h-[400px] flex flex-col justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              layout
            >
              {children}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}