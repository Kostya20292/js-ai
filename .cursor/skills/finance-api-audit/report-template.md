# Report template

The script fills the structure below. The agent may refine wording for backend authors without changing facts.

**Output language: Russian** (deliverable for API authors).

```markdown
# Аудит финансовых API — YYYY-MM-DD

## Мета

- Дата проверки: YYYY-MM-DD HH:mm (timezone)
- Окружение: production URL из `src/config/constants.ts`
- Источники: finance1, finance2, CurrencyFreaks rates
- Цель: список дефектов/неточностей данных на стороне сервера для исправления API

## Сводка

- Всего проблем: N (critical: A, major: B, minor: C, info: D)
- finance1: …
- finance2: …
- rates: …

Краткий вывод одним абзацем для авторов API.

## Критичные и важные находки

### [SEVERITY] Краткий заголовок

- Источник: finance1 | finance2 | rates
- Код проблемы: `CURRENCY_CASE` | `INVALID_CURRENCY` | …
- Количество: N
- Почему это проблема для клиентов
- Ожидание контракта
- Примеры (1–3):

\`\`\`json
{ "...": "сырой фрагмент" }
\`\`\`

- Рекомендация авторам API: конкретное действие

## Остальные находки

(Тот же формат, minor/info.)

## Что в порядке

Краткий список проверок без замечаний (чтобы бэкенд видел покрытие).

## Приложение

- Версия правил: skill `finance-api-audit`
```

## Stable issue codes

| Code                    | Meaning                                 |
| ----------------------- | --------------------------------------- |
| `HTTP_ERROR`            | Non-success HTTP                        |
| `SHAPE_INVALID`         | Invalid JSON shape                      |
| `MISSING_FIELD`         | Required field missing                  |
| `INVALID_TYPE`          | Wrong field type                        |
| `INVALID_AMOUNT`        | Amount does not parse                   |
| `INVALID_AMOUNT_STRING` | finance2 string does not match contract |
| `CURRENCY_CASE`         | Currency code is not UPPERCASE          |
| `INVALID_CURRENCY`      | Empty / not 3 letters / not ISO 4217    |
| `MISSING_RATE`          | Operation currency has no rate          |
| `INVALID_RATE`          | Rate ≤ 0 or not a number                |
| `BASE_MISMATCH`         | Rates `base` is not USD                 |
