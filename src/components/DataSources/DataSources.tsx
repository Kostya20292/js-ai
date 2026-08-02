import { auditSourcesReport } from 'virtual:audit-sources';
import type { AppRoute } from '@types';
import { AppNav } from '@components/AppNav/AppNav';
import { Dashboard } from '@components/Dashboard/Dashboard';
import { ReportSection } from '@components/ReportSection/ReportSection';
import { SourceCard } from '@components/SourceCard/SourceCard';
import styles from './DataSources.module.scss';

type DataSourcesProps = {
  currentRoute: AppRoute;
  handleNavigate: (route: AppRoute) => void;
};

export const DataSources = ({ currentRoute, handleNavigate }: DataSourcesProps) => {
  if (auditSourcesReport.status !== 'ready') {
    return (
      <Dashboard>
        <AppNav currentRoute={currentRoute} handleNavigate={handleNavigate} />
        <header className={styles.header}>
          <p className={styles.eyebrow}>Контракты расчёта</p>
          <h1>Источники данных</h1>
          <p className={styles.lead}>
            PDF-отчёт аудита не найден в docs/api-audit/. Список источников и замечания скрыты, пока
            нет файла вида YYYY-MM-DD-finance-api-audit.pdf.
          </p>
        </header>
        <section className={styles.empty} aria-live="polite">
          <h2 className={styles.emptyTitle}>Нет данных аудита</h2>
          <p className={styles.emptyText}>
            Запустите skill finance-api-audit, чтобы появился PDF — после этого источники и проблемы
            подтянутся автоматически.
          </p>
        </section>
      </Dashboard>
    );
  }

  const { sources, auditDate, pdfFileName } = auditSourcesReport;
  const withIssuesCount = sources.filter((source) => source.issues.length > 0).length;

  return (
    <Dashboard>
      <a href="#sources-content" className={styles.skipLink}>
        Перейти к списку источников
      </a>
      <AppNav currentRoute={currentRoute} handleNavigate={handleNavigate} />
      <header className={styles.header}>
        <p className={styles.eyebrow}>Контракты расчёта</p>
        <h1>Источники данных</h1>
        <p className={styles.lead}>
          Данные взяты из PDF-аудита{auditDate ? ` от ${auditDate}` : ''} ({pdfFileName}).
        </p>
      </header>

      <ReportSection
        title="Список источников"
        note={`С замечаниями: ${withIssuesCount} из ${sources.length}`}
      >
        <ul id="sources-content" className={styles.list} role="list" tabIndex={-1}>
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </ul>
      </ReportSection>
    </Dashboard>
  );
};
