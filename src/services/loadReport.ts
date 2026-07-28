import { fetchExchangeRates, sumInBaseCurrency } from '../api/exchangeRates'
import { fetchData } from '../api/fetchData'
import { firstSource, secondSource } from '../config/constants'
import type { Report } from '../types'
import { calculateDailyRevenue } from './calculateDailyRevenue'

export const loadReport = async (): Promise<Report> => {
  const [firstSourceData, secondSourceData, rates] = await Promise.all([
    fetchData(firstSource),
    fetchData(secondSource),
    fetchExchangeRates(),
  ])
  const totalsByCurrency = calculateDailyRevenue(firstSourceData, secondSourceData)
  const total = sumInBaseCurrency(totalsByCurrency, rates)

  return { totalsByCurrency, rates, total }
}
