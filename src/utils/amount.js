import Decimal from 'decimal.js'

import { AMOUNT_STRING_RE, CURRENCY_SCALE } from '../config/constants.js'
import { parseDecimal } from './decimal.js'

export { parseDecimal }

export const roundAmount = (value) =>
  parseDecimal(value, `Invalid amount: ${value}`).toFixed(CURRENCY_SCALE, Decimal.ROUND_HALF_UP)

export const normalizeEntry = (amount, currency) => {
  const decimalAmount = parseDecimal(amount, `Invalid amount: ${amount}`)

  if (typeof currency !== 'string' || !currency.trim()) {
    throw new Error(`Invalid currency: ${currency}`)
  }

  return { amount: decimalAmount, currency: currency.trim().toUpperCase() }
}

export const parseAmountString = (value) => {
  const match = String(value).trim().match(AMOUNT_STRING_RE)

  if (!match) {
    throw new Error(`Invalid amount string: ${value}`)
  }

  return normalizeEntry(match[1].replace(/,/g, ''), match[2])
}
