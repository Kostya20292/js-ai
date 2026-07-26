import './style.css'

import { fetchExchangeRates, sumInBaseCurrency } from './api/exchangeRates.js'
import { fetchData } from './api/fetchData.js'
import { firstSource, secondSource } from './config/constants.js'
import { calculateDailyRevenue } from './services/calculateDailyRevenue.js'
import { renderError, renderLoading, renderReport } from './ui/render.js'

const handleLoadReport = async () => {
  renderLoading()

  try {
    const [firstSourceData, secondSourceData, rates] = await Promise.all([
      fetchData(firstSource),
      fetchData(secondSource),
      fetchExchangeRates(),
    ])
    const totalsByCurrency = calculateDailyRevenue(firstSourceData, secondSourceData)
    const total = sumInBaseCurrency(totalsByCurrency, rates)

    renderReport({
      totalsByCurrency,
      rates,
      total,
      handleRefresh: handleLoadReport,
    })
  } catch (error) {
    console.error(error)
    renderError(handleLoadReport)
  }
}

handleLoadReport()
