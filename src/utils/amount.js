import { AMOUNT_STRING_RE, CURRENCY_SCALE } from '../config/constants.js'

const DECIMAL_RE = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i
const MINOR_UNITS_FACTOR = 10 ** CURRENCY_SCALE

const divideAndRound = (dividend, divisor) => {
  const quotient = dividend / divisor
  const remainder = dividend % divisor

  return remainder * 2n >= divisor ? quotient + 1n : quotient
}

export const parseDecimalRatio = (value, errorMessage) => {
  const match = String(value).trim().match(DECIMAL_RE)

  if (!match) {
    throw new Error(errorMessage)
  }

  const [, sign, integerPart, fractionPart = '', exponentPart = '0'] = match
  const exponent = Number(exponentPart) - fractionPart.length
  const coefficient = BigInt(`${integerPart}${fractionPart}`)
  const signedCoefficient = sign === '-' ? -coefficient : coefficient

  if (exponent >= 0) {
    return {
      numerator: signedCoefficient * 10n ** BigInt(exponent),
      denominator: 1n,
    }
  }

  return {
    numerator: signedCoefficient,
    denominator: 10n ** BigInt(-exponent),
  }
}

export const toMinorUnits = (value) => {
  const errorMessage = `Invalid amount: ${value}`
  const { numerator, denominator } = parseDecimalRatio(value, errorMessage)
  const isNegative = numerator < 0n
  const absoluteNumerator = isNegative ? -numerator : numerator
  const minorUnits = divideAndRound(
    absoluteNumerator * BigInt(MINOR_UNITS_FACTOR),
    denominator,
  )
  const signedMinorUnits = isNegative ? -minorUnits : minorUnits
  const amount = Number(signedMinorUnits)

  if (!Number.isSafeInteger(amount)) {
    throw new Error(errorMessage)
  }

  return amount
}

export const fromMinorUnits = (value) => {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Invalid amount in minor units: ${value}`)
  }

  return value / MINOR_UNITS_FACTOR
}

export const normalizeEntry = (amount, currency) => {
  const amountInMinorUnits = toMinorUnits(amount)

  if (typeof currency !== 'string' || !currency.trim()) {
    throw new Error(`Invalid currency: ${currency}`)
  }

  return { amount: amountInMinorUnits, currency: currency.trim().toUpperCase() }
}

export const parseAmountString = (value) => {
  const match = String(value).trim().match(AMOUNT_STRING_RE)

  if (!match) {
    throw new Error(`Invalid amount string: ${value}`)
  }

  return normalizeEntry(match[1].replace(/,/g, ''), match[2])
}
