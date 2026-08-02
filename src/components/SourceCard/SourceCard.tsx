import clsx from 'clsx';
import { useId } from 'react';
import type { DataSource, IssueSeverity } from '../../types';
import styles from './SourceCard.module.scss';

type SourceCardProps = {
  source: DataSource;
};

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  critical: 'Критичная',
  major: 'Важная',
  minor: 'Незначительная',
  info: 'Информация',
};

const severityClassName = (severity: IssueSeverity): string => {
  if (severity === 'critical' || severity === 'major') {
    return styles.severityDanger;
  }

  if (severity === 'info') {
    return styles.severityInfo;
  }

  return styles.severityMinor;
};

export const SourceCard = ({ source }: SourceCardProps) => {
  const titleId = useId();
  const hasIssues = source.issues.length > 0;
  const statusLabel = hasIssues ? `Есть замечания: ${source.issues.length}` : 'Замечаний нет';

  return (
    <li className={styles.card} aria-labelledby={titleId}>
      <div className={styles.top}>
        <div>
          <p className={styles.role}>{source.role}</p>
          <h3 id={titleId} className={styles.title}>
            {source.name}
          </h3>
        </div>
        <p
          className={clsx(styles.status, hasIssues ? styles.statusWarn : styles.statusOk)}
          aria-label={`Статус источника: ${statusLabel}`}
        >
          <span className={styles.statusMark} aria-hidden="true">
            {hasIssues ? '!' : '✓'}
          </span>
          <span>{statusLabel}</span>
        </p>
      </div>

      <dl className={styles.meta}>
        <div>
          <dt>URL</dt>
          <dd>
            <a href={source.url} className={styles.url} target="_blank" rel="noreferrer">
              {source.url}
            </a>
          </dd>
        </div>
        <div>
          <dt>Формат</dt>
          <dd>{source.format}</dd>
        </div>
        <div>
          <dt>Авторизация</dt>
          <dd>{source.auth}</dd>
        </div>
      </dl>

      {hasIssues && (
        <div className={styles.issues}>
          <h4 className={styles.issuesTitle}>Потенциальные проблемы</h4>
          <ul className={styles.issuesList} role="list">
            {source.issues.map((issue) => (
              <li key={`${issue.code}-${issue.title}`} className={styles.issue}>
                <p className={styles.issueHead}>
                  <span className={clsx(styles.severity, severityClassName(issue.severity))}>
                    {SEVERITY_LABEL[issue.severity]}
                  </span>
                  <span className={styles.issueCode}>{issue.code}</span>
                </p>
                <p className={styles.issueTitle}>{issue.title}</p>
                <p className={styles.issueDetail}>{issue.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};
