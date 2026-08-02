import clsx from 'clsx';
import { NAV_ITEMS } from '@config/constants';
import type { AppRoute } from '@types';
import styles from './AppNav.module.scss';

type AppNavProps = {
  currentRoute: AppRoute;
  handleNavigate: (route: AppRoute) => void;
};

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
