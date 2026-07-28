import { Dashboard } from '../Dashboard/Dashboard'
import { StatusCard } from '../StatusCard/StatusCard'
import styles from './LoadingState.module.scss'

export const LoadingState = () => (
  <Dashboard isBusy>
    <StatusCard
      icon={<span className={styles.loader} aria-hidden="true" />}
      title="Собираем отчёт"
      description="Загружаем операции и актуальные курсы валют"
    />
  </Dashboard>
)
