import { useId } from 'react'
import { BASE_CURRENCY } from '../../config/constants'
import { formatMoney } from '../../utils/format'
import styles from './TotalCard.module.scss'

type TotalCardProps = {
  total: number
}

export const TotalCard = ({ total }: TotalCardProps) => {
  const labelId = useId()

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <p id={labelId} className={styles.label}>
        Общая сумма в {BASE_CURRENCY}
      </p>
      <strong className={styles.amount}>{formatMoney(total, BASE_CURRENCY)}</strong>
      <span className={styles.caption}>Рассчитано по актуальному курсу</span>
    </section>
  )
}
