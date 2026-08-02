import type { AppRoute } from '@types';
import { AppNav } from '@components/AppNav/AppNav';
import { Dashboard } from '@components/Dashboard/Dashboard';
import { StatusCard } from '@components/StatusCard/StatusCard';
import styles from './LoadingState.module.scss';

type LoadingStateProps = {
  currentRoute: AppRoute;
  handleNavigate: (route: AppRoute) => void;
};

export const LoadingState = ({ currentRoute, handleNavigate }: LoadingStateProps) => (
  <Dashboard isBusy>
    <AppNav currentRoute={currentRoute} handleNavigate={handleNavigate} />
    <StatusCard
      icon={<span className={styles.loader} aria-hidden="true" />}
      title="Собираем отчёт"
      description="Загружаем операции и актуальные курсы валют"
    />
  </Dashboard>
);
