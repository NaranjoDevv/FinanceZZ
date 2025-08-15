"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthModal } from "./AuthModal";
import { motion } from "framer-motion";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  return (
    <AuthModal isOpen={isOpen} onClose={onClose} title="INICIAR SESIÓN">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <p className="text-black font-black uppercase tracking-wider text-sm">
          ACCEDE A TU CUENTA FINANCIERA
        </p>
        <motion.div
          className="w-16 h-1 bg-black mx-auto mt-3"
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              formButtonPrimary: "brutal-button brutal-button--primary w-full font-black uppercase tracking-wider transition-all duration-200 hover:shadow-brutal-lg",
              card: "shadow-none border-none bg-transparent w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "brutal-button mb-3 w-full font-black uppercase tracking-wide transition-all duration-200 hover:shadow-brutal",
              formFieldInput: "brutal-input font-medium",
              footerActionLink: "text-black font-black uppercase text-xs tracking-wider hover:underline transition-all duration-200",
              identityPreviewText: "font-black text-black uppercase tracking-wide",
              formFieldLabel: "font-black uppercase text-xs tracking-wider text-black mb-2",
              dividerLine: "bg-black h-1",
              dividerText: "text-black font-black uppercase text-xs tracking-wider px-4 bg-white",
              formFieldAction: "text-black font-black uppercase text-xs tracking-wide hover:underline transition-all duration-200",
              formFieldSuccessText: "text-green-600 font-black uppercase text-xs tracking-wide",
              formFieldErrorText: "text-red-600 font-black uppercase text-xs tracking-wide",
              formFieldWarningText: "text-yellow-600 font-black uppercase text-xs tracking-wide",
              otpCodeFieldInput: "brutal-input text-center font-black text-lg",
              formResendCodeLink: "text-black font-black uppercase text-xs tracking-wider hover:underline transition-all duration-200",
              socialButtonsBlockButtonText: "font-black uppercase tracking-wide",
              formButtonPrimaryText: "font-black uppercase tracking-wider",
              footer: "mt-6"
            },
            layout: {
              socialButtonsPlacement: "top"
            }
          }}
        />
      </motion.div>

      <motion.div
        className="text-center mt-8 pt-6 border-t-4 border-black"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <p className="text-sm font-black uppercase tracking-wide text-black">
          ¿NO TIENES CUENTA?{" "}
          <motion.button
            onClick={onSwitchToSignUp}
            className="text-black font-black uppercase tracking-wider ml-2 px-3 py-1 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            REGÍSTRATE
          </motion.button>
        </p>
      </motion.div>
    </AuthModal>
  );
}