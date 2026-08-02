type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';

const AUDIT_PDF_RE = /^(\d{4}-\d{2}-\d{2})-finance-api-audit\.pdf$/;

const SEVERITY_RE = /\[(CRITICAL|MAJOR|MINOR|INFO)\]\s*([^\n]+)/gi;

const SOURCE_ID_ALIASES: Record<string, string> = {
  finance1: 'finance1',
  finance2: 'finance2',
  rates: 'rates',
  currencyfreaks: 'rates',
  'currencyfreaks rates': 'rates',
};

export const normalizeAuditPdfText = (text: string): string =>
  text.replaceAll('ĸ', 'к').replaceAll('\f', '\n').replaceAll(/\r\n?/g, '\n');

export const parseAuditDateFromFileName = (fileName: string): string | null => {
  const match = AUDIT_PDF_RE.exec(fileName);
  return match?.[1] ?? null;
};

export const isAuditPdfFileName = (fileName: string): boolean => AUDIT_PDF_RE.test(fileName);

const normalizeSeverity = (value: string): IssueSeverity => {
  const severity = value.toLowerCase();

  if (
    severity === 'critical' ||
    severity === 'major' ||
    severity === 'minor' ||
    severity === 'info'
  ) {
    return severity;
  }

  return 'info';
};

const resolveSourceId = (raw: string): string | null => {
  const key = raw.trim().toLowerCase().replaceAll(/\s+/g, ' ');
  return SOURCE_ID_ALIASES[key] ?? null;
};

const extractField = (block: string, label: string): string | null => {
  const match = new RegExp(`${label}:\\s*([^\\n]+)`, 'i').exec(block);
  return match?.[1]?.trim() ?? null;
};

const extractDetail = (block: string): string => {
  const why =
    /Почему это проблема:\s*([\s\S]*?)(?:\nОжидание контракта:|\nРекомендация|\nПримеры:|$)/i.exec(
      block,
    );
  if (why?.[1]) {
    return why[1].replaceAll(/\s+/g, ' ').trim();
  }

  const comment = /Комментарий:\s*([\s\S]*?)(?:\nРекомендация:|\nПолный перечень|$)/i.exec(block);
  if (comment?.[1]) {
    return comment[1].replaceAll(/\s+/g, ' ').trim();
  }

  return 'См. PDF-отчёт аудита.';
};

export type ParsedAuditIssue = {
  sourceId: string;
  severity: IssueSeverity;
  code: string;
  title: string;
  detail: string;
};

export const parseAuditIssuesFromText = (rawText: string): ParsedAuditIssue[] => {
  const text = normalizeAuditPdfText(rawText);
  const issues: ParsedAuditIssue[] = [];
  const matches = [...text.matchAll(SEVERITY_RE)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? text.length;
    const block = text.slice(start, end);
    const severity = normalizeSeverity(match[1] ?? 'info');
    const title = (match[2] ?? '').trim();
    const sourceRaw = extractField(block, 'Источник');
    const code = extractField(block, 'Код проблемы');

    if (!sourceRaw || !code || !title) {
      continue;
    }

    const sourceId = resolveSourceId(sourceRaw);
    if (!sourceId) {
      continue;
    }

    issues.push({
      sourceId,
      severity,
      code,
      title,
      detail: extractDetail(block),
    });
  }

  return issues;
};
