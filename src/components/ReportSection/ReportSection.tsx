import clsx from 'clsx';
import { useId, type ReactNode } from 'react';
import styles from './ReportSection.module.scss';

type ReportSectionProps = {
  title: string;
  note: string;
  children: ReactNode;
  className?: string;
};

export const ReportSection = ({ title, note, children, className }: ReportSectionProps) => {
  const titleId = useId();

  return (
    <section className={clsx(styles.section, className)} aria-labelledby={titleId}>
      <div className={styles.heading}>
        <h2 id={titleId}>{title}</h2>
        <span className={styles.note}>{note}</span>
      </div>
      {children}
    </section>
  );
};
