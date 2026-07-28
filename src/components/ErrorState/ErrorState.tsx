import { Button } from '../Button/Button'
import { Dashboard } from '../Dashboard/Dashboard'
import { StatusCard } from '../StatusCard/StatusCard'
import styles from './ErrorState.module.scss'

type ErrorStateProps = {
  handleRetry: () => void
}

export const ErrorState = ({ handleRetry }: ErrorStateProps) => (
  <Dashboard>
    <StatusCard
      role="alert"
      icon={
        <span className={styles.icon} aria-hidden="true">
          !
        </span>
      }
      eyebrow="Не удалось загрузить данные"
      title="Что-то пошло не так"
      description="Проверьте подключение к интернету и попробуйте ещё раз."
    >
      <Button className={styles.retryButton} onClick={handleRetry}>
        Повторить
      </Button>
    </StatusCard>
  </Dashboard>
)
