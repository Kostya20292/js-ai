import { BASE_CURRENCY } from '../../config/constants'
import type { Rates, TotalsByCurrency } from '../../types'
import { formatRate } from '../../utils/format'
import { ReportSection } from '../ReportSection/ReportSection'
import styles from './RatesSection.module.scss'

type RatesSectionProps = {
  totalsByCurrency: TotalsByCurrency
  rates: Rates
}

export const RatesSection = ({ totalsByCurrency, rates }: RatesSectionProps) => {
  const usedCurrencies = Object.keys(totalsByCurrency).filter(
    (currency) => currency !== BASE_CURRENCY,
  )

  return (
    <ReportSection
      title="Использованные курсы"
      note="Актуальные данные"
      className={styles.section}
    >
      {usedCurrencies.length === 0 ? (
        <p className={styles.empty}>Конвертация валют не потребовалась</p>
      ) : (
        <ul className={styles.list}>
          {usedCurrencies.map((currency) => (
            <li key={currency} className={styles.item}>
              <span>1 {BASE_CURRENCY}</span>
              <strong className={styles.rate}>
                {formatRate(rates[currency])} {currency}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </ReportSection>
  )
}
