import {
  CURRENCY_SCALE,
  LOCALE,
  RATE_MAX_FRACTION_DIGITS,
  RATE_MIN_FRACTION_DIGITS,
} from '../config/constants'
import type { CurrencyCode } from '../types'
import { fromMinorUnits } from './amount'

export const formatMoney = (amountInMinorUnits: number, currency: CurrencyCode): string =>
  new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: CURRENCY_SCALE,
  }).format(fromMinorUnits(amountInMinorUnits))

export const formatRate = (rate: string): string =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: RATE_MIN_FRACTION_DIGITS,
    maximumFractionDigits: RATE_MAX_FRACTION_DIGITS,
  }).format(Number(rate))
