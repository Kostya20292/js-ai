import { normalizeEntry, parseAmountString, roundAmount } from '../utils/amount.js'

export const calculateDailyRevenue = (firstSource, secondSource) => {
  if (!firstSource || !Array.isArray(firstSource.transactions)) {
    throw new Error('firstSource.transactions must be an array')
  }

  if (!Array.isArray(secondSource)) {
    throw new Error('secondSource must be an array')
  }

  const fromFirst = firstSource.transactions
    .filter((transaction) => transaction.type === 'paid')
    .map((transaction) => normalizeEntry(transaction.amount, transaction.currency))

  const fromSecond = secondSource.map(parseAmountString)

  return [...fromFirst, ...fromSecond].reduce((totals, { amount, currency }) => {
    totals[currency] = roundAmount((totals[currency] ?? 0) + amount)
    return totals
  }, {})
}
