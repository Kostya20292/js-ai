import Decimal from 'decimal.js'

export const parseDecimal = (value, errorMessage) => {
  let decimalValue

  try {
    decimalValue = new Decimal(value)
  } catch {
    throw new Error(errorMessage)
  }

  if (!decimalValue.isFinite()) {
    throw new Error(errorMessage)
  }

  return decimalValue
}
