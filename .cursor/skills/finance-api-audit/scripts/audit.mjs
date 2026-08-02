#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../../..');
const OUT_DIR = join(ROOT, 'docs/api-audit');

const FINANCE1_URL = 'https://cpa-server-vtel.onrender.com/api/finance1';
const FINANCE2_URL = 'https://cpa-server-vtel.onrender.com/api/finance2';
const AMOUNT_STRING_RE = /^(\d[\d.,]*)\s*([A-Za-z]{3})$/;
const DECIMAL_RE = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i;
const CURRENCY_SCALE = 2;

const ISO_4217 = new Set([
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KPW',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLE',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SVC',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XCD',
  'XCG',
  'XDR',
  'XOF',
  'XPF',
  'YER',
  'ZAR',
  'ZMW',
  'ZWG',
  'ZWL',
]);

const loadEnv = async () => {
  const envPath = join(ROOT, '.env');
  let raw = '';

  try {
    raw = await readFile(envPath, 'utf8');
  } catch {
    throw new Error(`Не найден ${envPath}. Скопируйте .env.example и заполните ключи.`);
  }

  const env = { ...process.env };

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (env[key] === undefined) env[key] = value;
  }

  return env;
};

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const parseAmountOk = (value) => {
  const match = String(value).trim().match(DECIMAL_RE);
  if (!match) return false;

  try {
    const [, sign, integerPart, fractionPart = '', exponentPart = '0'] = match;
    const exponent = Number(exponentPart) - fractionPart.length;
    const coefficient = BigInt(`${integerPart}${fractionPart}`);
    const signedCoefficient = sign === '-' ? -coefficient : coefficient;
    let numerator;
    let denominator;

    if (exponent >= 0) {
      numerator = signedCoefficient * 10n ** BigInt(exponent);
      denominator = 1n;
    } else {
      numerator = signedCoefficient;
      denominator = 10n ** BigInt(-exponent);
    }

    const scaled = numerator * 10n ** BigInt(CURRENCY_SCALE);
    const quotient = scaled / denominator;
    const remainder = scaled % denominator;
    const absRemainder = remainder < 0n ? -remainder : remainder;
    const absDenominator = denominator < 0n ? -denominator : denominator;
    const rounded =
      absRemainder * 2n >= absDenominator ? quotient + (scaled < 0n ? -1n : 1n) : quotient;
    return Number.isSafeInteger(Number(rounded));
  } catch {
    return false;
  }
};

const createCollector = () => {
  const map = new Map();

  const add = (finding) => {
    const key = [finding.source, finding.code, finding.severity, finding.message].join('::');
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
      if (existing.examples.length < 3 && finding.example !== undefined) {
        existing.examples.push(finding.example);
      }
      return;
    }

    map.set(key, {
      severity: finding.severity,
      source: finding.source,
      code: finding.code,
      message: finding.message,
      expectation: finding.expectation,
      recommendation: finding.recommendation,
      count: 1,
      examples: finding.example !== undefined ? [finding.example] : [],
    });
  };

  return {
    add,
    list: () => [...map.values()],
  };
};

const fetchJson = async (url, headers = {}) => {
  const response = await fetch(url, { headers });
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: response.ok, status: response.status, data };
};

const checkCurrency = (collector, source, currency, example) => {
  if (typeof currency !== 'string' || !currency.trim()) {
    collector.add({
      source,
      code: 'INVALID_CURRENCY',
      severity: 'major',
      message: 'Пустой или нестроковый код валюты',
      expectation: 'Непустая строка из 3 латинских букв (ISO 4217), UPPERCASE',
      recommendation: 'Отдавать currency как строку ISO 4217 в верхнем регистре',
      example,
    });
    return null;
  }

  const trimmed = currency.trim();

  if (trimmed !== trimmed.toUpperCase()) {
    collector.add({
      source,
      code: 'CURRENCY_CASE',
      severity: 'minor',
      message: `Код валюты в смешанном/нижнем регистре: "${trimmed}"`,
      expectation: 'Всегда UPPERCASE, например USD',
      recommendation: 'Нормализовать currency.toUpperCase() на сервере перед ответом',
      example,
    });
  }

  if (!/^[A-Za-z]{3}$/.test(trimmed)) {
    collector.add({
      source,
      code: 'INVALID_CURRENCY',
      severity: 'major',
      message: `Код валюты не из 3 букв: "${trimmed}"`,
      expectation: 'Ровно 3 латинские буквы (ISO 4217)',
      recommendation: 'Валидировать код валюты на записи/отдаче',
      example,
    });
    return trimmed.toUpperCase();
  }

  const upper = trimmed.toUpperCase();

  if (!ISO_4217.has(upper)) {
    collector.add({
      source,
      code: 'INVALID_CURRENCY',
      severity: 'major',
      message: `Код валюты не найден в ISO 4217: "${trimmed}"`,
      expectation: 'Действующий код ISO 4217',
      recommendation: 'Использовать только стандартные коды или документировать кастомные явно',
      example,
    });
  }

  return upper;
};

const auditFinance1 = (data, status, ok, collector, currencies) => {
  if (!ok) {
    collector.add({
      source: 'finance1',
      code: 'HTTP_ERROR',
      severity: 'critical',
      message: `HTTP ${status}`,
      expectation: '2xx и JSON по контракту',
      recommendation: 'Проверить доступность /api/finance1 и API-ключ',
      example: { status },
    });
    return;
  }

  if (!isRecord(data)) {
    collector.add({
      source: 'finance1',
      code: 'SHAPE_INVALID',
      severity: 'critical',
      message: 'Ответ не является JSON-объектом',
      expectation: 'Объект с полем transactions (массив)',
      recommendation: 'Вернуть { "transactions": [ ... ] }',
      example: data,
    });
    return;
  }

  if (!Array.isArray(data.transactions)) {
    collector.add({
      source: 'finance1',
      code: 'SHAPE_INVALID',
      severity: 'critical',
      message: 'Нет массива transactions',
      expectation: 'transactions: Transaction[]',
      recommendation: 'Всегда отдавать transactions как массив (можно пустой)',
      example: { keys: Object.keys(data) },
    });
    return;
  }

  data.transactions.forEach((tx, index) => {
    if (!isRecord(tx)) {
      collector.add({
        source: 'finance1',
        code: 'INVALID_TYPE',
        severity: 'major',
        message: 'Элемент transactions не объект',
        expectation: 'Объект транзакции',
        recommendation: 'Каждый элемент — объект с type/amount/currency',
        example: { index, value: tx },
      });
      return;
    }

    if (tx.type !== 'paid') return;

    if (!('amount' in tx)) {
      collector.add({
        source: 'finance1',
        code: 'MISSING_FIELD',
        severity: 'major',
        message: 'У paid-транзакции нет amount',
        expectation: 'Поле amount обязательно для type=paid',
        recommendation: 'Гарантировать amount для paid',
        example: { index, tx },
      });
    } else if (!parseAmountOk(tx.amount)) {
      collector.add({
        source: 'finance1',
        code: 'INVALID_AMOUNT',
        severity: 'major',
        message: 'amount не парсится в денежную сумму',
        expectation: 'Число или числовая строка (decimal)',
        recommendation: 'Отдавать amount как число/строку с точкой, без мусора',
        example: { index, amount: tx.amount, tx },
      });
    }

    if (!('currency' in tx)) {
      collector.add({
        source: 'finance1',
        code: 'MISSING_FIELD',
        severity: 'major',
        message: 'У paid-транзакции нет currency',
        expectation: 'Поле currency обязательно для type=paid',
        recommendation: 'Гарантировать currency для paid',
        example: { index, tx },
      });
      return;
    }

    const code = checkCurrency(collector, 'finance1', tx.currency, { index, tx });
    if (code) currencies.add(code);
  });
};

const auditFinance2 = (data, status, ok, collector, currencies) => {
  if (!ok) {
    collector.add({
      source: 'finance2',
      code: 'HTTP_ERROR',
      severity: 'critical',
      message: `HTTP ${status}`,
      expectation: '2xx и JSON-массив строк',
      recommendation: 'Проверить доступность /api/finance2 и API-ключ',
      example: { status },
    });
    return;
  }

  if (!Array.isArray(data)) {
    collector.add({
      source: 'finance2',
      code: 'SHAPE_INVALID',
      severity: 'critical',
      message: 'Ответ не является массивом',
      expectation: 'string[] вида "123.45 USD"',
      recommendation: 'Вернуть JSON-массив строк',
      example: data,
    });
    return;
  }

  data.forEach((value, index) => {
    if (typeof value !== 'string') {
      collector.add({
        source: 'finance2',
        code: 'INVALID_TYPE',
        severity: 'major',
        message: 'Элемент массива не строка',
        expectation: 'Каждый элемент — строка "amount currency"',
        recommendation: 'Сериализовать операции только строками',
        example: { index, value },
      });
      return;
    }

    const match = value.trim().match(AMOUNT_STRING_RE);

    if (!match) {
      collector.add({
        source: 'finance2',
        code: 'INVALID_AMOUNT_STRING',
        severity: 'major',
        message: `Строка не соответствует контракту: "${value}"`,
        expectation: 'Формат /^(\\d[\\d.,]*)\\s*([A-Za-z]{3})$/',
        recommendation: 'Привести строки к виду "123.45 USD"',
        example: { index, value },
      });
      return;
    }

    const amountRaw = match[1].replace(/,/g, '');
    if (!parseAmountOk(amountRaw)) {
      collector.add({
        source: 'finance2',
        code: 'INVALID_AMOUNT',
        severity: 'major',
        message: `Сумма в строке не парсится: "${value}"`,
        expectation: 'Корректный decimal в начале строки',
        recommendation: 'Проверять сумму перед отдачей',
        example: { index, value },
      });
    }

    const code = checkCurrency(collector, 'finance2', match[2], { index, value });
    if (code) currencies.add(code);
  });
};

const auditRates = (data, status, ok, collector) => {
  if (!ok) {
    collector.add({
      source: 'rates',
      code: 'HTTP_ERROR',
      severity: 'critical',
      message: `HTTP ${status}`,
      expectation: '2xx, объект с rates и base=USD',
      recommendation: 'Проверить VITE_EXCHANGE_RATES_API_KEY и квоту CurrencyFreaks',
      example: { status },
    });
    return null;
  }

  if (!isRecord(data) || !isRecord(data.rates)) {
    collector.add({
      source: 'rates',
      code: 'SHAPE_INVALID',
      severity: 'critical',
      message: 'Нет объекта rates',
      expectation: '{ base: "USD", rates: { [code]: rate } }',
      recommendation: 'Сохранять контракт CurrencyFreaks latest',
      example: isRecord(data) ? { keys: Object.keys(data) } : data,
    });
    return null;
  }

  if (data.base !== 'USD') {
    collector.add({
      source: 'rates',
      code: 'BASE_MISMATCH',
      severity: 'critical',
      message: `base=${String(data.base)}, ожидается USD`,
      expectation: 'base строго "USD"',
      recommendation: 'Запрашивать/отдавать курсы с базой USD',
      example: { base: data.base },
    });
  }

  const rateKeys = new Set();

  for (const [currency, value] of Object.entries(data.rates)) {
    if (currency !== currency.toUpperCase()) {
      collector.add({
        source: 'rates',
        code: 'CURRENCY_CASE',
        severity: 'minor',
        message: `Ключ курса в неверном регистре: "${currency}"`,
        expectation: 'UPPERCASE ключи в rates',
        recommendation: 'Нормализовать ключи валют в верхний регистр',
        example: { currency, value },
      });
    }

    const upper = currency.trim().toUpperCase();
    rateKeys.add(upper);

    if (!/^[A-Z]{3}$/.test(upper) || !ISO_4217.has(upper)) {
      collector.add({
        source: 'rates',
        code: 'INVALID_CURRENCY',
        severity: 'info',
        message: `Подозрительный код в rates: "${currency}"`,
        expectation: 'ISO 4217',
        recommendation: 'Фильтровать нестандартные ключи или документировать их',
        example: { currency, value },
      });
    }

    const asNumber = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      collector.add({
        source: 'rates',
        code: 'INVALID_RATE',
        severity: 'major',
        message: `Некорректный курс для ${currency}: ${String(value)}`,
        expectation: 'Конечное число > 0',
        recommendation: 'Не отдавать нулевые/пустые/нечисловые курсы',
        example: { currency, value },
      });
    }
  }

  return rateKeys;
};

const main = async () => {
  const env = await loadEnv();
  const financeKey = env.VITE_FINANCE_API_KEY;
  const ratesKey = env.VITE_EXCHANGE_RATES_API_KEY;

  if (!financeKey) throw new Error('В .env нет VITE_FINANCE_API_KEY');
  if (!ratesKey) throw new Error('В .env нет VITE_EXCHANGE_RATES_API_KEY');

  const collector = createCollector();
  const currencies = new Set();
  const ratesUrl = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${ratesKey}`;

  const [finance1, finance2, rates] = await Promise.all([
    fetchJson(FINANCE1_URL, { 'x-api-key': financeKey }),
    fetchJson(FINANCE2_URL, { 'x-api-key': financeKey }),
    fetchJson(ratesUrl),
  ]);

  auditFinance1(finance1.data, finance1.status, finance1.ok, collector, currencies);
  auditFinance2(finance2.data, finance2.status, finance2.ok, collector, currencies);
  const rateKeys = auditRates(rates.data, rates.status, rates.ok, collector);

  if (rateKeys) {
    rateKeys.add('USD');
    for (const code of currencies) {
      if (!rateKeys.has(code)) {
        collector.add({
          source: 'rates',
          code: 'MISSING_RATE',
          severity: 'major',
          message: `Нет курса для валюты операции ${code}`,
          expectation: 'Для каждой валюты из finance1/finance2 есть rate',
          recommendation: 'Добавить курс или не отдавать операции в этой валюте',
          example: { currency: code },
        });
      }
    }
  }

  const findings = collector.list();
  const severityRank = { critical: 0, major: 1, minor: 2, info: 3 };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.count - a.count);

  const counts = { critical: 0, major: 0, minor: 0, info: 0 };
  for (const item of findings) counts[item.severity] += 1;

  const bySource = { finance1: 0, finance2: 0, rates: 0 };
  for (const item of findings) bySource[item.source] = (bySource[item.source] ?? 0) + 1;

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const stamp = now.toLocaleString('ru-RU', { timeZoneName: 'short' });
  const baseName = `${date}-finance-api-audit`;
  const pdfPath = join(OUT_DIR, `${baseName}.pdf`);
  const tempMdPath = join(OUT_DIR, `${baseName}.tmp.md`);

  await mkdir(OUT_DIR, { recursive: true });

  const formatExamples = (examples) => {
    if (!examples.length) return '_нет_';
    return examples
      .map((example) => `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``)
      .join('\n\n');
  };

  const sectionFor = (list) => {
    if (!list.length) return '_Нет_\n';
    return list
      .map(
        (item) => `### [${item.severity.toUpperCase()}] ${item.message}

- Источник: \`${item.source}\`
- Код проблемы: \`${item.code}\`
- Количество: ${item.count}
- Ожидание контракта: ${item.expectation}
- Рекомендация авторам API: ${item.recommendation}
- Примеры:

${formatExamples(item.examples)}
`,
      )
      .join('\n');
  };

  const isRatesNoise = (item) =>
    item.source === 'rates' && item.code === 'INVALID_CURRENCY' && item.severity === 'info';

  const important = findings.filter(
    (item) => item.severity === 'critical' || item.severity === 'major',
  );
  const other = findings.filter(
    (item) => (item.severity === 'minor' || item.severity === 'info') && !isRatesNoise(item),
  );
  const ratesNoise = findings.filter(isRatesNoise);

  const ratesNoiseSection =
    ratesNoise.length === 0
      ? ''
      : `### [INFO] Нестандартные коды в CurrencyFreaks \`rates\` (сжато)

- Источник: \`rates\`
- Код проблемы: \`INVALID_CURRENCY\`
- Количество уникальных ключей вне ISO 4217: **${ratesNoise.length}**
- Примеры: ${ratesNoise
          .slice(0, 5)
          .map((item) => item.message.match(/"([^"]+)"/)?.[1] ?? '?')
          .join(', ')}${ratesNoise.length > 5 ? ', …' : ''}
- Комментарий: шум провайдера курсов (крипто/тикеры), не дефект CPA \`finance1\`/\`finance2\`.
- Рекомендация: для CPA API — ничего; при желании фильтровать rates по ISO / валютам операций.

`;

  const okBits = [];
  if (finance1.ok && isRecord(finance1.data) && Array.isArray(finance1.data.transactions)) {
    okBits.push('- finance1: HTTP OK, есть массив `transactions`');
  }
  if (finance2.ok && Array.isArray(finance2.data)) {
    okBits.push('- finance2: HTTP OK, ответ — массив');
  }
  if (rates.ok && isRecord(rates.data) && isRecord(rates.data.rates) && rates.data.base === 'USD') {
    okBits.push('- rates: HTTP OK, есть `rates`, `base === USD`');
  }
  if (!okBits.length) okBits.push('- Базовые проверки формы не пройдены — см. находки выше');

  const summaryLine =
    findings.length === 0
      ? 'Критических несоответствий контракту не обнаружено; ответы выглядят пригодными для текущего клиента.'
      : `Обнаружены проблемы в данных API (critical=${counts.critical}, major=${counts.major}, minor=${counts.minor}, info=${counts.info}). Ниже — конкретные дефекты и рекомендации для исправления на стороне сервера.`;

  const md = `# Аудит финансовых API — ${date}

## Мета

- Дата проверки: ${stamp}
- Окружение: \`https://cpa-server-vtel.onrender.com\` + CurrencyFreaks
- Источники: finance1, finance2, CurrencyFreaks rates
- Цель: список дефектов/неточностей данных на стороне сервера для исправления API

## Сводка

- Всего проблем: ${findings.length} (critical: ${counts.critical}, major: ${counts.major}, minor: ${counts.minor}, info: ${counts.info})
- finance1: ${bySource.finance1}
- finance2: ${bySource.finance2}
- rates: ${bySource.rates}

${summaryLine}

## Критичные и важные находки

${sectionFor(important)}
## Остальные находки

${sectionFor(other)}
${ratesNoiseSection}## Что в порядке

${okBits.join('\n')}

## Приложение

- Версия правил: skill \`finance-api-audit\`
`;

  await writeFile(tempMdPath, md, 'utf8');

  await new Promise((resolvePromise, reject) => {
    const child = spawn('npx', ['--yes', 'md-to-pdf', tempMdPath], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`md-to-pdf exited with code ${code}`));
    });
  });

  const generatedPdf = tempMdPath.replace(/\.tmp\.md$/i, '.tmp.pdf');
  await rename(generatedPdf, pdfPath);
  await unlink(tempMdPath);

  console.log(JSON.stringify({ pdfPath, counts, total: findings.length }, null, 2));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
