import { BASE_CURRENCY } from '../config/constants.js'

const app = document.querySelector('#app')

const formatMoney = (amount, currency) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)

const formatRate = (rate) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rate)

const createCurrencyCards = (totalsByCurrency, rates) =>
  Object.entries(totalsByCurrency)
    .map(
      ([currency, amount]) => `
        <li class="currency-card">
          <span class="currency-code">${currency}</span>
          <strong>${formatMoney(amount, currency)}</strong>
          <span>В базовой валюте: ${formatMoney(amount / rates[currency], BASE_CURRENCY)}</span>
        </li>
      `,
    )
    .join('')

const createRateRows = (totalsByCurrency, rates) =>
  Object.keys(totalsByCurrency)
    .filter((currency) => currency !== BASE_CURRENCY)
    .map(
      (currency) => `
        <li>
          <span>1 ${BASE_CURRENCY}</span>
          <strong>${formatRate(rates[currency])} ${currency}</strong>
        </li>
      `,
    )
    .join('')

export const renderLoading = () => {
  app.innerHTML = `
    <main class="dashboard" aria-busy="true">
      <section class="status-card">
        <span class="loader" aria-hidden="true"></span>
        <h1>Собираем отчёт</h1>
        <p>Загружаем операции и актуальные курсы валют</p>
      </section>
    </main>
  `
}

export const renderError = (handleRetry) => {
  app.innerHTML = `
    <main class="dashboard">
      <section class="status-card error-card" role="alert">
        <span class="status-icon" aria-hidden="true">!</span>
        <p class="eyebrow">Не удалось загрузить данные</p>
        <h1>Что-то пошло не так</h1>
        <p>Проверьте подключение к интернету и попробуйте ещё раз.</p>
        <button class="retry-button" type="button">Повторить</button>
      </section>
    </main>
  `

  app.querySelector('.retry-button').addEventListener('click', handleRetry)
}

export const renderReport = ({ totalsByCurrency, rates, total, handleRefresh }) => {
  const currencyCards = createCurrencyCards(totalsByCurrency, rates)
  const rateRows = createRateRows(totalsByCurrency, rates)

  app.innerHTML = `
    <main class="dashboard">
      <header class="page-header">
        <div>
          <p class="eyebrow">Финансовый отчёт</p>
          <h1>Дневная выручка</h1>
        </div>
        <button class="refresh-button" type="button" aria-label="Обновить данные">Обновить</button>
      </header>

      <section class="total-card" aria-labelledby="total-title">
        <p id="total-title">Общая сумма в ${BASE_CURRENCY}</p>
        <strong>${formatMoney(total, BASE_CURRENCY)}</strong>
        <span>Рассчитано по актуальному курсу</span>
      </section>

      <section class="report-section" aria-labelledby="currencies-title">
        <div class="section-heading">
          <h2 id="currencies-title">Суммы по валютам</h2>
          <span>Валют: ${Object.keys(totalsByCurrency).length}</span>
        </div>
        <ul class="currency-grid">${currencyCards}</ul>
      </section>

      <section class="report-section rates-section" aria-labelledby="rates-title">
        <div class="section-heading">
          <h2 id="rates-title">Использованные курсы</h2>
          <span>Актуальные данные</span>
        </div>
        ${
          rateRows
            ? `<ul class="rate-list">${rateRows}</ul>`
            : `<p class="empty-state">Конвертация валют не потребовалась</p>`
        }
      </section>
    </main>
  `

  app.querySelector('.refresh-button').addEventListener('click', handleRefresh)
}
