/**
 * Utilidades para formatear precios y monedas
 */

export interface CurrencyConfig {
  symbol: string;
  code: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  COP: {
    symbol: '$',
    code: 'COP',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    decimals: 0,
    symbolPosition: 'before'
  },
  USD: {
    symbol: '$',
    code: 'USD',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    decimals: 2,
    symbolPosition: 'before'
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    decimals: 2,
    symbolPosition: 'after'
  }
};

/**
 * Formatea un número como precio con separadores de miles
 * @param value - El valor numérico a formatear
 * @param currency - El código de moneda (COP, USD, EUR)
 * @param showSymbol - Si mostrar el símbolo de moneda
 * @returns El precio formateado
 */
export function formatPrice(
  value: number | string,
  currency: string = 'COP',
  showSymbol: boolean = true
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '';
  }

  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.COP!;

  // Formatear el número con separadores
  const parts = numValue.toFixed(config.decimals).split('.');
  const integerPart = (parts[0] || '0').replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
  const decimalPart = parts[1];

  let formattedNumber = integerPart;
  if (config.decimals > 0 && decimalPart) {
    formattedNumber += config.decimalSeparator + decimalPart;
  }

  if (!showSymbol) {
    return formattedNumber;
  }

  // Agregar símbolo según la posición
  if (config.symbolPosition === 'before') {
    return config.symbol + formattedNumber;
  } else {
    return formattedNumber + config.symbol;
  }
}

/**
 * Parsea un string formateado de precio a número
 * @param formattedPrice - El precio formateado como string
 * @param currency - El código de moneda
 * @returns El valor numérico
 */
export function parseFormattedPrice(
  formattedPrice: string,
  currency: string = 'COP'
): number {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.COP!;

  // Remover símbolo de moneda
  let cleanPrice = formattedPrice.replace(config.symbol, '').trim();

  // Remover separadores de miles
  cleanPrice = cleanPrice.replace(new RegExp('\\' + config.thousandsSeparator, 'g'), '');

  // Reemplazar separador decimal por punto
  if (config.decimalSeparator !== '.') {
    cleanPrice = cleanPrice.replace(config.decimalSeparator, '.');
  }

  return parseFloat(cleanPrice) || 0;
}

/**
 * Formatea un input de precio en tiempo real
 * @param inputValue - El valor del input
 * @param currency - El código de moneda
 * @returns El valor formateado para mostrar en el input
 */
export function formatPriceInput(
  inputValue: string,
  currency: string = 'COP'
): string {
  // Remover caracteres no numéricos excepto el separador decimal
  const cleanValue = inputValue.replace(/[^\d.,]/g, '');

  if (!cleanValue) {
    return '';
  }

  // Parsear y formatear
  const numValue = parseFormattedPrice(cleanValue, currency);
  return formatPrice(numValue, currency, false);
}

/**
 * Hook personalizado para manejar inputs de precio
 */
export function usePriceInput(initialValue: string = '', currency: string = 'COP') {
  const [displayValue, setDisplayValue] = React.useState(
    initialValue ? formatPriceInput(initialValue, currency) : ''
  );
  const [rawValue, setRawValue] = React.useState(
    initialValue ? parseFormattedPrice(initialValue, currency) : 0
  );

  const handleChange = React.useCallback((value: string) => {
    const formatted = formatPriceInput(value, currency);
    const raw = parseFormattedPrice(formatted, currency);

    setDisplayValue(formatted);
    setRawValue(raw);
  }, [currency]);

  const setValue = React.useCallback((value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
      setDisplayValue(formatPrice(numValue, currency, false));
      setRawValue(numValue);
    }
  }, [currency]);

  return {
    displayValue,
    rawValue,
    handleChange,
    setValue,
    formattedValue: formatPrice(rawValue, currency, true)
  };
}

// Importar React para el hook
import React from 'react';