# Finance API audit checklist

Used by `scripts/audit.mjs` and by the agent when refining the report manually.

## Severity

| Level      | When                                                              |
| ---------- | ----------------------------------------------------------------- |
| `critical` | Response cannot be parsed safely; breaks report loading           |
| `major`    | Data is lost / distorted, or a currency has no rate               |
| `minor`    | Inconsistency (case, etc.) that the client may silently normalize |
| `info`     | Observation without a clear defect                                |

## finance1 (`/api/finance1`)

- [ ] HTTP 2xx, body is a JSON object
- [ ] `transactions` exists and is an array
- [ ] Each element is an object
- [ ] For `type === 'paid'`: `amount` and `currency` are present
- [ ] `amount` is a finite number or numeric string (not `NaN`, not an object)
- [ ] `currency` is a non-empty 3-letter string (after trim)
- [ ] Currency code is uppercase (`USD`, not `usd`)
- [ ] Code is in ISO 4217
- [ ] Amount parses into minor units without error (see client `toMinorUnits`)

## finance2 (`/api/finance2`)

- [ ] HTTP 2xx, body is a JSON array
- [ ] Each element is a string
- [ ] String matches `^(\d[\d.,]*)\s*([A-Za-z]{3})$` (same as `AMOUNT_STRING_RE`)
- [ ] Currency is uppercase
- [ ] Currency is ISO 4217
- [ ] Amount is valid (no garbage fraction; parses into minor units)

## CurrencyFreaks rates

- [ ] HTTP 2xx, JSON object
- [ ] `rates` object is present
- [ ] `base === "USD"` (strict, as the client expects)
- [ ] Each rate is a positive finite number / numeric string `> 0`
- [ ] Currency keys are 3 letters; preferably UPPERCASE
- [ ] Every currency from paid/operation strings has a rate (after `toUpperCase`)

## Cross-cutting

- [ ] Currencies from operations ⊆ `rates` keys (case-insensitive)
- [ ] Non-`paid` finance1 types that look like money — `info` only if useful for API authors
- [ ] Group identical issues: severity, code, count, 1–3 payload examples
