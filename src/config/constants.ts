import type { CurrencyCode } from '../types'

export const API_KEY = import.meta.env.VITE_FINANCE_API_KEY

export const firstSource = 'https://cpa-server-vtel.onrender.com/api/finance1'
export const secondSource = 'https://cpa-server-vtel.onrender.com/api/finance2'

export const AMOUNT_STRING_RE = /^(\d[\d.,]*)\s*([A-Za-z]{3})$/

export const EXCHANGE_RATES_API_KEY = import.meta.env.VITE_EXCHANGE_RATES_API_KEY
export const exchangeRatesSource = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${EXCHANGE_RATES_API_KEY}`

export const BASE_CURRENCY: CurrencyCode = 'USD'

export const BASE_CURRENCY_RATE = '1'

export const CURRENCY_SCALE = 2

export const RATE_MIN_FRACTION_DIGITS = 2

export const RATE_MAX_FRACTION_DIGITS = 4

export const LOCALE = 'ru-RU'
