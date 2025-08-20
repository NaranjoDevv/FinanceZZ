'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Elementos decorativos brutales flotantes - Ocultos en móvil */}
      <div className="absolute inset-0 hidden sm:block">
        <motion.div
          className="absolute top-20 left-20 w-4 h-4 bg-black"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-32 right-32 w-6 h-6 border-4 border-black"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-2 h-16 bg-black"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-8 h-2 bg-black"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
      
      {/* Elementos decorativos móviles simplificados */}
      <div className="absolute inset-0 sm:hidden">
        <div className="absolute top-4 right-4 w-3 h-3 bg-black" />
        <div className="absolute bottom-4 left-4 w-2 h-8 bg-black" />
        <div className="absolute top-1/3 right-8 w-6 h-1 bg-black" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header brutal responsivo */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl font-black text-black mb-4 sm:mb-6 tracking-tighter uppercase mt-8 sm:mt-16">
            FINANCEZZ
          </h1>
          <p className="text-black font-black text-lg sm:text-xl uppercase tracking-wide">
            INICIAR SESIÓN
          </p>
        </motion.div>

        {/* Contenedor del formulario brutal responsivo */}
        <motion.div
          className="bg-white border-2 sm:border-4 border-black p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 sm:mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <SignIn
            path="/sign-in"
            appearance={{
              elements: {
                rootBox: {
                  width: '100%'
                },
                card: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                },
                headerTitle: {
                  display: 'none'
                },
                headerSubtitle: {
                  display: 'none'
                },
                formButtonPrimary: {
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #000000',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  fontSize: '13px',
                  padding: '14px 24px',
                  borderRadius: '0',
                  transition: 'all 0.2s ease',
                  boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
                  width: '100%',
                  '@media (min-width: 640px)': {
                    border: '3px solid #000000',
                    fontSize: '14px',
                    padding: '16px 32px',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                  },
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    '@media (min-width: 640px)': {
                      transform: 'translate(-2px, -2px)',
                      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'
                    }
                  },
                  '&:active': {
                    transform: 'translate(1px, 1px)',
                    boxShadow: '1px 1px 0px 0px rgba(0,0,0,1)',
                    '@media (min-width: 640px)': {
                      transform: 'translate(2px, 2px)',
                      boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                    }
                  }
                },
                formFieldInput: {
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '0',
                  fontSize: '15px',
                  padding: '10px 12px',
                  color: '#000000',
                  fontWeight: '600',
                  width: '100%',
                  '@media (min-width: 640px)': {
                    border: '3px solid #000000',
                    fontSize: '16px',
                    padding: '12px 16px'
                  },
                  '&:focus': {
                    backgroundColor: '#ffffff',
                    borderColor: '#000000',
                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                    transform: 'translate(-1px, -1px)',
                    '@media (min-width: 640px)': {
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      transform: 'translate(-2px, -2px)'
                    }
                  }
                },
                formFieldLabel: {
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                },
                socialButtonsBlockButton: {
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  color: '#000000',
                  fontWeight: '700',
                  borderRadius: '0',
                  boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
                  width: '100%',
                  fontSize: '13px',
                  padding: '12px 16px',
                  '@media (min-width: 640px)': {
                    border: '3px solid #000000',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontSize: '14px',
                    padding: '14px 20px'
                  },
                  '&:hover': {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    transform: 'translate(-1px, -1px)',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    '@media (min-width: 640px)': {
                      transform: 'translate(-2px, -2px)',
                      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'
                    }
                  }
                },
                dividerLine: {
                  backgroundColor: '#000000',
                  height: '2px',
                  '@media (min-width: 640px)': {
                    height: '3px'
                  }
                },
                dividerText: {
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  '@media (min-width: 640px)': {
                    fontSize: '14px'
                  }
                },
                footerActionLink: {
                  color: '#000000',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  '&:hover': {
                    color: '#333333'
                  }
                }
              }
            }}
          />
        </motion.div>

        {/* Botón de volver brutal responsivo */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center bg-white border-2 sm:border-3 border-black px-4 sm:px-6 py-2 sm:py-3 font-black text-black uppercase tracking-wide text-sm sm:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:transform hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:transform active:translate-x-[1px] active:translate-y-[1px] sm:active:translate-x-[2px] sm:active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">VOLVER AL INICIO</span>
            <span className="sm:hidden">VOLVER</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}