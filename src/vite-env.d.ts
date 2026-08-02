/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FINANCE_API_KEY: string;
  readonly VITE_EXCHANGE_RATES_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:audit-sources' {
  export const auditSourcesReport: import('./types').AuditSourcesReport;
}
