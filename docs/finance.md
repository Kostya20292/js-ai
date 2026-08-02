# Финансы и денежные суммы

## Главный принцип

Все суммы внутри приложения хранятся в **минорных единицах** (для scale = 2 это центы/копейки). Разбор десятичных строк и конвертация по курсу выполняются на **`BigInt`**, чтобы не ловить ошибки плавающей точки.

## Масштаб и базовая валюта

| Константа            | Значение | Смысл                        |
| -------------------- | -------- | ---------------------------- |
| `CURRENCY_SCALE`     | `2`      | знаков после запятой у денег |
| `BASE_CURRENCY`      | `USD`    | валюта итога                 |
| `BASE_CURRENCY_RATE` | `'1'`    | курс базы к самой себе       |
| `LOCALE`             | `ru-RU`  | форматирование в UI          |

## Ключевые функции

| Функция                                | Файл                   | Назначение                       |
| -------------------------------------- | ---------------------- | -------------------------------- |
| `toMinorUnits` / `fromMinorUnits`      | `utils/amount.ts`      | вход/выход из минорных единиц    |
| `parseDecimalRatio`                    | `utils/amount.ts`      | десятичная строка → дробь BigInt |
| `normalizeEntry` / `parseAmountString` | `utils/amount.ts`      | нормализация операции            |
| `convertToBaseCurrency`                | `api/exchangeRates.ts` | сумма → база по курсу            |
| `sumInBaseCurrency`                    | `api/exchangeRates.ts` | сумма итогов по валютам в базе   |
| `formatMoney` / `formatRate`           | `utils/format.ts`      | только отображение               |

## Инварианты

- Арифметика денег не через обычный `number` float.
- После операций — проверка `Number.isSafeInteger`, иначе `throw`.
- Курс валюты строго больше нуля; базовый курс USD = `'1'`.
- Код валюты — непустая строка, `trim().toUpperCase()`.
- В UI деньги только через `formatMoney` / `formatRate`.
- Компоненты не парсят сырые строки сумм — это зона `utils` / `services`.

```typescript
// ❌ BAD — float
const total = 10.5 + 0.2;

// ✅ GOOD — minor units + BigInt-конвертация
const total = sumInBaseCurrency(totalsByCurrency, rates);
```
