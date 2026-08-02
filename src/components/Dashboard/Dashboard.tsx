import type { ReactNode } from 'react';
import styles from './Dashboard.module.scss';

type DashboardProps = {
  children: ReactNode;
  isBusy?: boolean;
};

export const Dashboard = ({ children, isBusy = false }: DashboardProps) => (
  <main className={styles.dashboard} aria-busy={isBusy}>
    {children}
  </main>
);
