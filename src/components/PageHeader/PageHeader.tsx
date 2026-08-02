import { Button } from '@components/Button/Button';
import styles from './PageHeader.module.scss';

type PageHeaderProps = {
  handleRefresh: () => void;
};

export const PageHeader = ({ handleRefresh }: PageHeaderProps) => (
  <header className={styles.header}>
    <div>
      <p className={styles.eyebrow}>Финансовый отчёт</p>
      <h1>Дневная выручка</h1>
    </div>
    <Button isCompact aria-label="Обновить данные" onClick={handleRefresh}>
      Обновить
    </Button>
  </header>
);
