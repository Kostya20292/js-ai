---
name: finance-api-audit
description: >-
  Audits live finance API responses (finance1, finance2, CurrencyFreaks rates)
  for server-side data issues: currency case, invalid ISO codes, broken amount
  formats, missing fields, shape mismatches, currencies without rates. Produces
  a Russian PDF report for backend/API authors under docs/api-audit/.
  Use when the user asks to check or audit finance API data, find API problems,
  verify server responses, or generate a backend-facing finance API report.
---

# Finance API Audit

Audit **live** finance API responses and produce a report for backend / API authors.
Run **only when the user asks**. Report language: **Russian**. Deliverable: **PDF only**.

## Quick start

1. Read [checks.md](checks.md) and [report-template.md](report-template.md).
2. Run the audit (requires `.env` keys from `.env.example`):

```bash
node .cursor/skills/finance-api-audit/scripts/audit.mjs
```

3. The script writes **only**:
   - `docs/api-audit/YYYY-MM-DD-finance-api-audit.pdf`
4. Show the user the PDF path and briefly summarize critical findings.

Do **not** leave `.md` or `.findings.json` in `docs/api-audit/` (temp markdown is deleted after PDF generation).

If the script fails (missing keys / network) — do not invent data: fix the cause or stop with a clear error.

## Sources

Contract: [docs/api.md](../../../docs/api.md). Constants: `src/config/constants.ts`.

| Source   | URL / constant                     | Expected shape                                                                             |
| -------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| finance1 | `firstSource` → `/api/finance1`    | object with `transactions[]`; for revenue — `type === 'paid'`, fields `amount`, `currency` |
| finance2 | `secondSource` → `/api/finance2`   | array of strings `"<amount> <currency>"` (`AMOUNT_STRING_RE`)                              |
| rates    | CurrencyFreaks `v2.0/rates/latest` | object `rates`, `base === USD`                                                             |

Keys: `VITE_FINANCE_API_KEY` (`x-api-key`), `VITE_EXCHANGE_RATES_API_KEY` (query). Never commit `.env`.

## What counts as a server issue

Record as an issue (examples and severity in [checks.md](checks.md)):

- inconsistent currency code case (`usd` / `Usd` instead of `USD`)
- code not in ISO 4217 / empty / not 3 letters
- broken amount or operation-string format
- missing / wrong field types (`amount`, `currency`, `type`, `transactions`)
- unexpected response shape (not an array / no `transactions`)
- operation currency missing from `rates`
- rate ≤ 0, non-numeric rate, `base !== USD`
- duplicate anomalies — group them; include count and examples
- collapse CurrencyFreaks non-ISO `info` noise into one summary block in the PDF

Do not treat client-side normalization (`toUpperCase`) as “API is fine” — **still report** it as a server inconsistency: a client workaround does not cancel a data defect.

## Workflow

```
Progress:
- [ ] 1. Run audit.mjs
- [ ] 2. Confirm only the PDF exists under docs/api-audit/
- [ ] 3. Tell the user the outcome and PDF path
```

## Artifacts

Directory: `docs/api-audit/`

| File                               | Purpose            |
| ---------------------------------- | ------------------ |
| `YYYY-MM-DD-finance-api-audit.pdf` | report for backend |

Date = run day (local). Re-run same day — **overwrite** that day’s PDF.

PDF is built via `npx md-to-pdf` inside `audit.mjs` (network needed on first run). Temp `.tmp.md` must be removed after success.

## Additional resources

- Checklist: [checks.md](checks.md)
- Report template (Russian output): [report-template.md](report-template.md)
- Client money invariants: [docs/finance.md](../../../docs/finance.md)
