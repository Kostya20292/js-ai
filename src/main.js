import './style.css';

import { calculateDailyRevenue } from './calculateDailyRevenue.js';
import { BASE_CURRENCY, firstSource, secondSource } from './constants.js';
import { fetchExchangeRates, sumInBaseCurrency } from './exchangeRates.js';
import { fetchData } from './fetchData.js';

const firstSourceData = await fetchData(firstSource);
const secondSourceData = await fetchData(secondSource);
const ratesRequest = fetchExchangeRates();
const rates = await ratesRequest;

const totalsByCurrency = calculateDailyRevenue(firstSourceData, secondSourceData);
const total = sumInBaseCurrency(totalsByCurrency, rates);

console.log('Totals by currency:', totalsByCurrency);
console.log(
  'Rates used:',
  Object.fromEntries(Object.keys(totalsByCurrency).map((currency) => [currency, rates[currency]])),
);
console.log(`Total: ${total} ${BASE_CURRENCY}`);
