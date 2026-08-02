export type CurrencyCode = string;

export type Rates = Record<CurrencyCode, string>;

export type TotalsByCurrency = Record<CurrencyCode, number>;

export type MoneyEntry = {
  amount: number;
  currency: CurrencyCode;
};

export type DecimalRatio = {
  numerator: bigint;
  denominator: bigint;
};

export type Report = {
  totalsByCurrency: TotalsByCurrency;
  rates: Rates;
  total: number;
};

export type ReportState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; report: Report };

export type AppRoute = 'report' | 'sources';

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

export type DataSourceIssue = {
  severity: IssueSeverity;
  code: string;
  title: string;
  detail: string;
};

export type DataSource = {
  id: string;
  name: string;
  role: string;
  url: string;
  format: string;
  auth: string;
  issues: DataSourceIssue[];
};

export type AuditSourcesReport =
  | { status: 'missing' }
  | {
      status: 'ready';
      auditDate: string | null;
      pdfFileName: string;
      sources: DataSource[];
    };
