import { AMOUNT_STRING_RE } from './constants.js';

export const roundAmount = (value) => Number(value.toFixed(2));

export const normalizeEntry = (amount, currency) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  if (typeof currency !== 'string' || !currency.trim()) {
    throw new Error(`Invalid currency: ${currency}`);
  }
  return { amount: numericAmount, currency: currency.trim().toUpperCase() };
};

export const parseAmountString = (value) => {
  const match = String(value).trim().match(AMOUNT_STRING_RE);
  if (!match) {
    throw new Error(`Invalid amount string: ${value}`);
  }
  return normalizeEntry(match[1].replace(/,/g, ''), match[2]);
};
