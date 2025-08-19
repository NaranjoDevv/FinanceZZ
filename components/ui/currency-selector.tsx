"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Currency, getAvailableCurrencies } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
}

export function CurrencySelector({ value, onChange, disabled = false }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currencies = getAvailableCurrencies();

  const selectedCurrency = currencies.find(c => c.code === value);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between brutal-border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg">{selectedCurrency?.symbol}</span>
          <span className="font-medium">{selectedCurrency?.name}</span>
          <span className="text-sm text-gray-500">({selectedCurrency?.code})</span>
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-20 mt-2"
          >
            <Card className="brutal-card p-2 bg-white shadow-lg">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                    currency.code === value
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100 text-black'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">{currency.symbol}</span>
                    <span className="font-medium">{currency.name}</span>
                    <span className="text-sm opacity-70">({currency.code})</span>
                  </div>
                  {currency.code === value && (
                    <CheckIcon className="w-4 h-4" />
                  )}
                </button>
              ))}
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}