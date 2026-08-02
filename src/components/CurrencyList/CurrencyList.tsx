import type { Rates, TotalsByCurrency } from '@types';
import { CurrencyCard } from '@components/CurrencyCard/CurrencyCard';
import styles from './CurrencyList.module.scss';

type CurrencyListProps = {
  totalsByCurrency: TotalsByCurrency;
  rates: Rates;
};

export const CurrencyList = ({ totalsByCurrency, rates }: CurrencyListProps) => (
  <ul className={styles.grid}>
    {Object.entries(totalsByCurrency).map(([currency, amount]) => (
      <CurrencyCard key={currency} currency={currency} amount={amount} rates={rates} />
    ))}
  </ul>
);
