import clsx from 'clsx';
import type { AppRoute } from '@types';
import styles from './AppNav.module.scss';

type AppNavProps = {
  currentRoute: AppRoute;
  handleNavigate: (route: AppRoute) => void;
};

const NAV_ITEMS: { route: AppRoute; label: string }[] = [
  { route: 'report', label: 'Отчёт' },
  { route: 'sources', label: 'Источники данных' },
];

export const AppNav = ({ currentRoute, handleNavigate }: AppNavProps) => (
  <nav className={styles.nav} aria-label="Разделы приложения">
    <ul className={styles.list} role="list">
      {NAV_ITEMS.map(({ route, label }) => {
        const isCurrent = route === currentRoute;

        return (
          <li key={route}>
            <button
              type="button"
              className={clsx(styles.link, isCurrent && styles.current)}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => handleNavigate(route)}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
