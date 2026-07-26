import { BASE_CURRENCY, exchangeRatesSource } from '../config/constants.js'
import { roundAmount } from '../utils/amount.js'
import { fetchData } from './fetchData.js'

const parseRate = (currency, value) => {
  const rate = Number(value)

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid exchange rate for ${currency}: ${value}`)
  }

  return rate
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
    { [BASE_CURRENCY]: 1 },
  )
}

export const convertToBaseCurrency = (amount, currency, rates) => {
  const rate = rates[currency]

  if (!rate) {
    throw new Error(`No exchange rate for ${currency} to ${BASE_CURRENCY}`)
  }

  return amount / rate
}

export const sumInBaseCurrency = (totalsByCurrency, rates) => {
  const total = Object.entries(totalsByCurrency).reduce(
    (sum, [currency, amount]) => sum + convertToBaseCurrency(amount, currency, rates),
    0,
  )

  return roundAmount(total)
}
