import { ErrorState } from './components/ErrorState/ErrorState'
import { LoadingState } from './components/LoadingState/LoadingState'
import { Report } from './components/Report/Report'
import { useDailyRevenue } from './hooks/useDailyRevenue'

export const App = () => {
  const { state, handleReload } = useDailyRevenue()

  return (
    <>
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState handleRetry={handleReload} />}
      {state.status === 'success' && (
        <Report report={state.report} handleRefresh={handleReload} />
      )}
    </>
  )
}
