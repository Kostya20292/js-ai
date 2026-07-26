import { normalizeEntry, parseAmountString, roundAmount } from '../utils/amount.js'

export const calculateDailyRevenue = (firstSource, secondSource) => {
  if (!firstSource || !Array.isArray(firstSource.transactions)) {
    throw new Error('firstSource.transactions must be an array')
  }

  if (!Array.isArray(secondSource)) {
    throw new Error('secondSource must be an array')
  }

  const totals = {}

  const add = ({ amount, currency }) => {
    totals[currency] = totals[currency]?.plus(amount) ?? amount
  }

  for (const transaction of firstSource.transactions) {
    if (transaction.type !== 'paid') continue
    add(normalizeEntry(transaction.amount, transaction.currency))
  }

  for (const value of secondSource) {
    add(parseAmountString(value))
  }

  return Object.fromEntries(
    Object.entries(totals).map(([currency, amount]) => [currency, roundAmount(amount)]),
  )
}
