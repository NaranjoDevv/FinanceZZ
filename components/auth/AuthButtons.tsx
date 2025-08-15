"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { SignInModal } from "./SignInModal";
import { SignUpModal } from "./SignUpModal";

const buttonVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: "4px 4px 0px 0px #000000",
  },
  hover: {
    y: -4,
    x: 4,
    boxShadow: "8px 8px 0px 0px #000000",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    y: 2,
    x: 2,
    boxShadow: "2px 2px 0px 0px #000000",
    transition: {
      type: "spring",
      stiffness: 800,
      damping: 10,
    },
  },
};

const groupVariants: Variants = {
  scrolled: {
    scale: 0.9,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  unscrolled: {
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

export function AuthButtons() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <>
      <motion.div
        className="flex gap-2"
        variants={groupVariants}
        animate={isScrolled ? "scrolled" : "unscrolled"}
      >
        <motion.button
          onClick={handleSignInClick}
          className="brutal-button brutal-button--primary"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          Iniciar Sesión
        </motion.button>
        <motion.button
          onClick={handleSignUpClick}
          className="brutal-button"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          Registrarse
        </motion.button>
      </motion.div>

      <SignInModal
        isOpen={showSignIn}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={handleCloseModals}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </>
  );
}