# API и источники данных

## Переменные окружения

| Переменная                    | Назначение                                      |
| ----------------------------- | ----------------------------------------------- |
| `VITE_FINANCE_API_KEY`        | Заголовок `x-api-key` для источников операций   |
| `VITE_EXCHANGE_RATES_API_KEY` | Ключ api.currencyfreaks.com (в query-параметре) |

Шаблон: `.env.example`. Файл `.env` в репозиторий не коммитить.

## Источники операций

| Константа      | URL             | Формат                            |
| -------------- | --------------- | --------------------------------- |
| `firstSource`  | `/api/finance1` | Объект с массивом `transactions`  |
| `secondSource` | `/api/finance2` | Массив строк `"<сумма> <валюта>"` |

Базовый хост: `https://cpa-server-vtel.onrender.com`.

### Первый источник

- Берутся только транзакции с `type === 'paid'`.
- Поля: `amount`, `currency`.
- Нормализация через `normalizeEntry`.

### Второй источник

- Каждый элемент — строка вида `123.45 USD` (см. `AMOUNT_STRING_RE`).
- Парсинг через `parseAmountString`.

## Курсы валют

- Endpoint: CurrencyFreaks `v2.0/rates/latest`.
- Запрос **без** `x-api-key` (`withApiKey: false`).
- В ответе обязательны объект `rates` и `base === USD`.
- Базовый курс USD всегда `'1'`.

## Клиент

Общая обёртка — `fetchData` (`src/api/fetchData.ts`):

- по умолчанию добавляет `x-api-key` (`withApiKey: true`);
- для CurrencyFreaks — `withApiKey: false`;
- при ошибке HTTP бросает `Error` с URL и статусом;
- возвращает JSON как `unknown` — дальше обязательна проверка формы (`isRecord` / `Array.isArray`).

Параллельная загрузка отчёта — `Promise.all` в `loadReport`.

## UI-состояние при запросах

- Ошибки сети/парсинга лови в хуке (`useDailyRevenue`), пиши в `console.error`, UI — `status: 'error'`.
- Учитывай размонтирование (`isActive`), чтобы не вызывать `setState` после unmount.
