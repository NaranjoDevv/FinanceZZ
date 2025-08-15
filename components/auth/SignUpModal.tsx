"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { AuthModal } from "./AuthModal";
import { motion } from "framer-motion";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose} title="CREAR CUENTA">
      {/* Subtitle with staggered animation */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <p className="text-black font-black uppercase text-sm tracking-wider">
          ÚNETE Y TOMA CONTROL DE TUS FINANZAS
        </p>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        className="w-full h-1 bg-black mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />

      {/* Clerk SignUp component with animation */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              formButtonPrimary: "brutal-button brutal-button--primary w-full font-black uppercase tracking-wider transition-all duration-200 hover:shadow-brutal-lg",
              card: "shadow-none border-none bg-transparent",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "brutal-button mb-2 w-full font-black uppercase tracking-wide transition-all duration-200 hover:shadow-brutal",
              formFieldInput: "brutal-input transition-all duration-200 focus:shadow-brutal",
              footerActionLink: "text-black font-black uppercase hover:underline transition-all duration-200",
              identityPreviewText: "font-black uppercase tracking-wide",
              formFieldLabel: "font-black uppercase text-sm tracking-wider text-black",
              dividerLine: "bg-black h-1",
              dividerText: "text-black font-black uppercase text-xs tracking-wider bg-white px-4",
              formFieldAction: "text-black font-black uppercase hover:underline transition-all duration-200",
              formFieldSuccessText: "text-green-600 font-black uppercase text-xs tracking-wide",
              formFieldErrorText: "text-red-600 font-black uppercase text-xs tracking-wide",
              formFieldWarningText: "text-yellow-600 font-black uppercase text-xs tracking-wide",
              otpCodeFieldInput: "brutal-input text-center transition-all duration-200 focus:shadow-brutal",
              formResendCodeLink: "text-black font-black uppercase hover:underline transition-all duration-200",
            }
          }}
        />
      </motion.div>

      {/* Footer with animation and brutal styling */}
      <motion.div
        className="text-center mt-8 pt-6 border-t-4 border-black"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <p className="text-sm font-black uppercase tracking-wide text-black">
          ¿YA TIENES CUENTA?{" "}
          <motion.button
            onClick={onSwitchToSignIn}
            className="text-black font-black uppercase ml-2 px-3 py-1 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            INICIA SESIÓN
          </motion.button>
        </p>
      </motion.div>
    </AuthModal>
  );
}