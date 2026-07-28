import { normalizeEntry, parseAmountString } from '../utils/amount.js'

export const calculateDailyRevenue = (firstSource, secondSource) => {
  if (!firstSource || !Array.isArray(firstSource.transactions)) {
    throw new Error('firstSource.transactions must be an array')
  }

  if (!Array.isArray(secondSource)) {
    throw new Error('secondSource must be an array')
  }

  const totals = {}

  const add = ({ amount, currency }) => {
    const total = (totals[currency] ?? 0) + amount

    if (!Number.isSafeInteger(total)) {
      throw new Error(`Total for ${currency} exceeds the safe integer range`)
    }

    totals[currency] = total
  }

  for (const transaction of firstSource.transactions) {
    if (transaction.type !== 'paid') continue
    add(normalizeEntry(transaction.amount, transaction.currency))
  }

  for (const value of secondSource) {
    add(parseAmountString(value))
  }

  return totals
}
