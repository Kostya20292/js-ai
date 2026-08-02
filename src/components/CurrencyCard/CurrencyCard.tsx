import { convertToBaseCurrency } from '@api/exchangeRates';
import { BASE_CURRENCY } from '@config/constants';
import type { CurrencyCode, Rates } from '@types';
import { formatMoney } from '@utils/format';
import styles from './CurrencyCard.module.scss';

type CurrencyCardProps = {
  currency: CurrencyCode;
  amount: number;
  rates: Rates;
};

export const CurrencyCard = ({ currency, amount, rates }: CurrencyCardProps) => (
  <li className={styles.card}>
    <span className={styles.code}>{currency}</span>
    <strong className={styles.amount}>{formatMoney(amount, currency)}</strong>
    <span className={styles.converted}>
      В базовой валюте: {formatMoney(convertToBaseCurrency(amount, currency, rates), BASE_CURRENCY)}
    </span>
  </li>
);
