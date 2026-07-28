export type CurrencyCode = string

export type Rates = Record<CurrencyCode, string>

export type TotalsByCurrency = Record<CurrencyCode, number>

export type MoneyEntry = {
  amount: number
  currency: CurrencyCode
}

export type DecimalRatio = {
  numerator: bigint
  denominator: bigint
}

export type Report = {
  totalsByCurrency: TotalsByCurrency
  rates: Rates
  total: number
}

export type ReportState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; report: Report }
