// Tipos de moneda soportadas
export type Currency = 'USD' | 'COP';

// Configuración de monedas
export const CURRENCIES: Record<Currency, {
  code: Currency;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}> = {
  USD: {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  },
  COP: {
    code: 'COP',
    name: 'Peso Colombiano',
    symbol: '$',
    locale: 'es-CO',
    decimals: 0,
  },
};

// Función para formatear moneda
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const config = CURRENCIES[currency];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

// Función para obtener el símbolo de la moneda
export function getCurrencySymbol(currency: Currency = 'USD'): string {
  return CURRENCIES[currency].symbol;
}

// Función para obtener el nombre de la moneda
export function getCurrencyName(currency: Currency = 'USD'): string {
  return CURRENCIES[currency].name;
}

// Función para obtener todas las monedas disponibles
export function getAvailableCurrencies(): Array<{
  code: Currency;
  name: string;
  symbol: string;
}> {
  return Object.values(CURRENCIES).map(({ code, name, symbol }) => ({
    code,
    name,
    symbol,
  }));
}

// Función para validar si una moneda es válida
export function isValidCurrency(currency: string): currency is Currency {
  return currency in CURRENCIES;
}

// Función para convertir string a Currency type
export function toCurrency(currency: string): Currency {
  if (isValidCurrency(currency)) {
    return currency;
  }
  return 'USD'; // fallback por defecto
}

// Función para formatear números con redondeo (1M, 1K, etc.)
export function formatNumberWithRounding(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1000000000) {
    return `${sign}${(absAmount / 1000000000).toFixed(1)}B`;
  } else if (absAmount >= 1000000) {
    return `${sign}${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${absAmount.toFixed(0)}`;
  }
}

// Función para formatear moneda con opción de redondeo
export function formatCurrencyWithRounding(
  amount: number, 
  currency: Currency = 'USD', 
  useRounding: boolean = false
): string {
  if (useRounding) {
    const config = CURRENCIES[currency];
    const roundedAmount = formatNumberWithRounding(amount);
    return `${config.symbol}${roundedAmount.replace(/^-/, '')}`;
  }
  
  return formatCurrency(amount, currency);
}

// Función para obtener el valor completo formateado (para tooltips)
export function getFullFormattedValue(amount: number, currency: Currency = 'USD'): string {
  return formatCurrency(amount, currency);
}