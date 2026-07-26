import {
  BASE_CURRENCY,
  BASE_CURRENCY_RATE,
  exchangeRatesSource,
} from '../config/constants.js'
import { parseDecimal, roundAmount } from '../utils/amount.js'
import { fetchData } from './fetchData.js'

const parseRate = (currency, value) => {
  const rate = parseDecimal(value, `Invalid exchange rate for ${currency}: ${value}`)

  if (!rate.isPositive()) {
    throw new Error(`Invalid exchange rate for ${currency}: ${value}`)
  }

  return rate.toString()
}

export const fetchExchangeRates = async () => {
  const data = await fetchData(exchangeRatesSource, { withApiKey: false })

  if (!data || typeof data.rates !== 'object') {
    throw new Error('Exchange rates response has no rates')
  }

  if (data.base !== BASE_CURRENCY) {
    throw new Error(`Expected rates based on ${BASE_CURRENCY}, got ${data.base}`)
  }

  return Object.entries(data.rates).reduce(
    (rates, [currency, value]) => {
      rates[currency.toUpperCase()] = parseRate(currency, value)
      return rates
    },
    { [BASE_CURRENCY]: BASE_CURRENCY_RATE },
  )
}

export const convertToBaseCurrency = (amount, currency, rates) => {
  const rate = rates[currency]

  if (!rate) {
    throw new Error(`No exchange rate for ${currency} to ${BASE_CURRENCY}`)
  }

  const decimalRate = parseDecimal(rate, `Invalid exchange rate for ${currency}: ${rate}`)

  if (!decimalRate.isPositive()) {
    throw new Error(`Invalid exchange rate for ${currency}: ${rate}`)
  }

  return parseDecimal(amount, `Invalid amount: ${amount}`).dividedBy(decimalRate).toString()
}

export const sumInBaseCurrency = (totalsByCurrency, rates) => {
  const total = Object.entries(totalsByCurrency).reduce(
    (sum, [currency, amount]) => sum.plus(convertToBaseCurrency(amount, currency, rates)),
    parseDecimal(0, 'Invalid initial total'),
  )

  return roundAmount(total)
}
