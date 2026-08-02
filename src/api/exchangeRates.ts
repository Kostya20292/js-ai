import { BASE_CURRENCY, BASE_CURRENCY_RATE, exchangeRatesSource } from '@config/constants';
import type { CurrencyCode, Rates, TotalsByCurrency } from '@types';
import { parseDecimalRatio } from '@utils/amount';
import { isRecord } from '@utils/guards';
import { fetchData } from './fetchData';

const parseRate = (currency: CurrencyCode, value: unknown): string => {
  const errorMessage = `Invalid exchange rate for ${currency}: ${String(value)}`;
  const rate = parseDecimalRatio(value, errorMessage);

  if (rate.numerator <= 0n) {
    throw new Error(errorMessage);
  }

  return String(value).trim();
};

const divideAndRound = (dividend: bigint, divisor: bigint): bigint => {
  const isNegative = dividend < 0n;
  const absoluteDividend = isNegative ? -dividend : dividend;
  const quotient = absoluteDividend / divisor;
  const remainder = absoluteDividend % divisor;
  const rounded = remainder * 2n >= divisor ? quotient + 1n : quotient;

  return isNegative ? -rounded : rounded;
};

export const fetchExchangeRates = async (): Promise<Rates> => {
  const data = await fetchData(exchangeRatesSource, { withApiKey: false });

  if (!isRecord(data) || !isRecord(data.rates)) {
    throw new Error('Exchange rates response has no rates');
  }

  if (data.base !== BASE_CURRENCY) {
    throw new Error(`Expected rates based on ${BASE_CURRENCY}, got ${String(data.base)}`);
  }

  return Object.entries(data.rates).reduce<Rates>(
    (rates, [currency, value]) => {
      rates[currency.toUpperCase()] = parseRate(currency, value);
      return rates;
    },
    { [BASE_CURRENCY]: BASE_CURRENCY_RATE },
  );
};

export const convertToBaseCurrency = (
  amountInMinorUnits: number,
  currency: CurrencyCode,
  rates: Rates,
): number => {
  if (!Number.isSafeInteger(amountInMinorUnits)) {
    throw new Error(`Invalid amount in minor units: ${amountInMinorUnits}`);
  }

  const rate = rates[currency];

  if (!rate) {
    throw new Error(`No exchange rate for ${currency} to ${BASE_CURRENCY}`);
  }

  const { numerator, denominator } = parseDecimalRatio(
    rate,
    `Invalid exchange rate for ${currency}: ${rate}`,
  );

  if (numerator <= 0n) {
    throw new Error(`Invalid exchange rate for ${currency}: ${rate}`);
  }

  const convertedAmount = Number(
    divideAndRound(BigInt(amountInMinorUnits) * denominator, numerator),
  );

  if (!Number.isSafeInteger(convertedAmount)) {
    throw new Error(`Converted amount for ${currency} exceeds the safe integer range`);
  }

  return convertedAmount;
};

export const sumInBaseCurrency = (totalsByCurrency: TotalsByCurrency, rates: Rates): number =>
  Object.entries(totalsByCurrency).reduce((sum, [currency, amount]) => {
    const total = sum + convertToBaseCurrency(amount, currency, rates);

    if (!Number.isSafeInteger(total)) {
      throw new Error('Total in base currency exceeds the safe integer range');
    }

    return total;
  }, 0);
