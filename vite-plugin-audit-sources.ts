import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import { extractText, getDocumentProxy } from 'unpdf';
import {
  isAuditPdfFileName,
  parseAuditDateFromFileName,
  parseAuditIssuesFromText,
  type ParsedAuditIssue,
} from './audit-sources/parseAuditReport.ts';

const VIRTUAL_ID = 'virtual:audit-sources';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

type SourceMeta = {
  id: string;
  name: string;
  role: string;
  url: string;
  format: string;
  auth: string;
};

const buildSourceCatalog = (): SourceMeta[] => {
  const host = 'https://cpa-server-vtel.onrender.com';

  return [
    {
      id: 'finance1',
      name: 'Finance 1',
      role: 'Операции (первый источник)',
      url: `${host}/api/finance1`,
      format: 'Объект с массивом transactions; учитываются только type === "paid"',
      auth: 'Заголовок x-api-key',
    },
    {
      id: 'finance2',
      name: 'Finance 2',
      role: 'Операции (второй источник)',
      url: `${host}/api/finance2`,
      format: 'Массив строк вида "<сумма> <валюта>"',
      auth: 'Заголовок x-api-key',
    },
    {
      id: 'rates',
      name: 'CurrencyFreaks',
      role: 'Курсы валют',
      url: 'https://api.currencyfreaks.com/v2.0/rates/latest',
      format: 'Объект rates; base должен быть USD',
      auth: 'Ключ в query-параметре apikey (без x-api-key)',
    },
  ];
};

const listAuditPdfs = async (auditDir: string) => {
  try {
    const entries = await readdir(auditDir);
    return entries
      .filter((name) => isAuditPdfFileName(name))
      .sort((left, right) => right.localeCompare(left));
  } catch {
    return [];
  }
};

const loadReportModule = async (root: string): Promise<string> => {
  const auditDir = path.join(root, 'docs/api-audit');
  const pdfs = await listAuditPdfs(auditDir);

  if (pdfs.length === 0) {
    return `export const auditSourcesReport = ${JSON.stringify({ status: 'missing' })}`;
  }

  const pdfFileName = pdfs[0];
  if (!pdfFileName) {
    return `export const auditSourcesReport = ${JSON.stringify({ status: 'missing' })}`;
  }

  const auditDate = parseAuditDateFromFileName(pdfFileName);
  const pdfPath = path.join(auditDir, pdfFileName);
  const bytes = new Uint8Array(await readFile(pdfPath));
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  const parsedIssues: ParsedAuditIssue[] = parseAuditIssuesFromText(text);
  const catalog = buildSourceCatalog();

  const sources = catalog.map((source) => ({
    ...source,
    issues: parsedIssues
      .filter((issue: ParsedAuditIssue) => issue.sourceId === source.id)
      .map((issue: ParsedAuditIssue) => ({
        severity: issue.severity,
        code: issue.code,
        title: issue.title,
        detail: issue.detail,
      })),
  }));

  const report = {
    status: 'ready' as const,
    auditDate,
    pdfFileName,
    sources,
  };

  return `export const auditSourcesReport = ${JSON.stringify(report)}`;
};

export const auditSourcesPlugin = (): Plugin => {
  let root = process.cwd();

  return {
    name: 'audit-sources',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    async load(id) {
      if (id !== RESOLVED_ID) {
        return;
      }

      return loadReportModule(root);
    },
    configureServer(server) {
      const auditDir = path.join(root, 'docs/api-audit');
      server.watcher.add(auditDir);

      const invalidate = (file: string) => {
        if (!file.includes(`${path.sep}api-audit${path.sep}`) || !file.endsWith('.pdf')) {
          return;
        }

        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          void server.reloadModule(mod);
        }
      };

      server.watcher.on('add', invalidate);
      server.watcher.on('change', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
};
