# Прогресс проекта

Журнал выполненных задач. Новые записи — сверху.

## 2026-08-02 — Prettier (Airbnb-стиль)

### Кратко

- добавлены `prettier` и `eslint-config-prettier`
- конфиг совпадает с настройками Prettier в Cursor (singleQuote, printWidth 100, trailingComma all и др.)
- скрипты `format` / `format:check`; `build` сначала запускает форматирование
- весь код прогнан через Prettier

### Детали

- `.prettierrc.json`, `.prettierignore`
- `eslint.config.js` — `eslint-config-prettier/flat` в конце
- `package.json` — скрипты и devDependencies

## 2026-08-02 — path aliases по слоям

### Кратко

- добавлены алиасы `@api`, `@config`, `@services`, `@hooks`, `@components`, `@utils`, `@types`
- все кросс-слойные импорты в `src` переведены на алиасы
- внутри одной папки оставлены относительные `./`

### Детали

- `tsconfig.app.json` (`paths` без deprecated `baseUrl`), `vite.config.ts` (`resolve.alias`)
- обновлены импорты в слоях и компонентах; `docs/architecture.md` — соглашение по алиасам

### Следующие шаги

- при желании настроить ESLint `import/order` под алиасы

## 2026-08-02 — источники из PDF аудита

### Кратко

- хардкод `dataSources.ts` удалён
- Vite-плагин читает последний `docs/api-audit/*-finance-api-audit.pdf`
- нет PDF — экран источников без списка; есть PDF — карточки и замечания из отчёта

### Детали

- `vite-plugin-audit-sources.ts`, `audit-sources/parseAuditReport.ts`, `virtual:audit-sources`
- зависимость `unpdf` для извлечения текста
- обновлены `DataSources`, `docs/architecture.md`

## 2026-08-02 — экраны без смены URL

### Кратко

- hash-роутинг убран (`useAppRoute` удалён)
- активный экран хранится в `useState` внутри `App`
- `AppNav` переключает экраны через `button` + `handleNavigate`

### Детали

- обновлены `App`, `AppNav`, `Report`, `DataSources`, loading/error
- `docs/architecture.md` — экраны без URL

## 2026-08-02 — страница источников данных

### Кратко

- добавлен экран источников данных со списком ресурсов расчёта
- на карточках отмечены потенциальные проблемы по аудиту API
- навигация `AppNav` на отчёте, загрузке, ошибке и источниках
- переключение экранов через локальный state (без смены URL)

### Детали

- `src/config/dataSources.ts`, `SourceCard`, `DataSources`, `AppNav`
- замечания: finance2 (`CURRENCY_CASE`), CurrencyFreaks (info `INVALID_CURRENCY`)
- обновлён `docs/architecture.md`

### Следующие шаги

- при желании подтянуть замечания с живого аудита вместо статического списка

## 2026-08-02 — аудит API: только PDF

### Кратко

- артефакт аудита — только `docs/api-audit/*.pdf`
- md/json больше не сохраняются; `generate-pdf.mjs` удалён
- `audit.mjs` сам пишет temp md → PDF → удаляет temp

### Детали

- обновлены SKILL.md, report-template, README api-audit
- удалены лишние md/findings.json от прошлого прогона

## 2026-08-02 — прогон аудита финансовых API

### Кратко

- выполнен live-аудит finance1 / finance2 / rates
- critical/major нет; в finance2 — нижний регистр `usd`/`eur` (minor)
- отчёт и PDF: `docs/api-audit/2026-08-02-finance-api-audit.{md,pdf,findings.json}`
- info по не-ISO ключам CurrencyFreaks сжаты в сводку в md/pdf

### Детали

- сырой findings.json сохраняет полный список (870 групп)

## 2026-08-02 — skill EN / docs api-audit RU

### Кратко

- `description` в SKILL.md полностью на английском
- `docs/api-audit/README.md` снова на русском

### Детали

- инструкции skill — EN; документация в `docs/` — RU

## 2026-08-02 — skill finance-api-audit на английском

### Кратко

- инструкции skill (`SKILL.md`, `checks.md`) переведены на английский
- шаблон отчёта: обрамление на английском, тело отчёта для бэкенда — русский
- `docs/api-audit/README.md` обновлён

### Детали

- выходной отчёт для авторов API по-прежнему на русском

## 2026-08-02 — skill аудита финансовых API

### Кратко

- добавлен project skill `finance-api-audit` для проверки live-ответов API
- скрипт аудита пишет markdown + findings.json в `docs/api-audit/`
- PDF генерируется всегда через `generate-pdf.mjs` (md-to-pdf)
- отчёт на русском, запуск только по запросу

### Детали

- `.cursor/skills/finance-api-audit/` — SKILL.md, checks.md, report-template.md, scripts/
- `docs/api-audit/README.md`, ссылка в `docs/README.md`

### Следующие шаги

- по запросу прогнать аудит на текущих данных и отдать PDF бэкенду

## 2026-08-02 — правила Cursor на английском

### Кратко

- все `.cursor/rules/*.mdc` переведены на английский
- записи в `docs/progress.md` по-прежнему на русском
- доки в `docs/` не менялись

### Детали

- `project-architecture`, `api-server`, `finance-money`, `code-style`, `progress-reports`

## 2026-08-02 — убрали дубли docs ↔ rules

### Кратко

- полные тексты оставлены только в `docs/`
- правила Cursor стали короткими ссылками на доки
- добавлен индекс `docs/README.md`

### Детали

- обновлены `docs/architecture.md`, `api.md`, `finance.md`, `code-style.md`
- урезаны `.cursor/rules/{project-architecture,api-server,finance-money,code-style}.mdc`

## 2026-08-02 — локальные Cursor-правила и документация

### Кратко

- добавлены правила агента: архитектура, API, финансы, стиль кода
- написана человекочитаемая документация в `docs/`
- финансы зафиксированы жёстко: minor units + BigInt, без float
- `global-rules.md` не трогали

### Детали

- `.cursor/rules/project-architecture.mdc` — alwaysApply
- `.cursor/rules/api-server.mdc`, `code-style.mdc`, `finance-money.mdc` — по globs
- `docs/architecture.md`, `docs/api.md`, `docs/finance.md`, `docs/code-style.md`

### Следующие шаги

- при необходимости уточнить globs или дополнить правила по ходу разработки

## 2026-08-01 — workflow отчётов о прогрессе

### Кратко

- добавлено правило Cursor: после каждой завершённой задачи писать отчёт
- создан файл журнала `docs/progress.md`
- формат: кратко / детали / следующие шаги, на русском, коротко

### Детали

- `.cursor/rules/progress-reports.mdc` — alwaysApply
- `docs/progress.md` — журнал прогресса
