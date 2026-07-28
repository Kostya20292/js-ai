import type { Report as ReportData } from '../../types'
import { CurrencyList } from '../CurrencyList/CurrencyList'
import { Dashboard } from '../Dashboard/Dashboard'
import { PageHeader } from '../PageHeader/PageHeader'
import { RatesSection } from '../RatesSection/RatesSection'
import { ReportSection } from '../ReportSection/ReportSection'
import { TotalCard } from '../TotalCard/TotalCard'

type ReportProps = {
  report: ReportData
  handleRefresh: () => void
}

export const Report = ({ report, handleRefresh }: ReportProps) => {
  const { totalsByCurrency, rates, total } = report
  const currenciesCount = Object.keys(totalsByCurrency).length

  return (
    <Dashboard>
      <PageHeader handleRefresh={handleRefresh} />
      <TotalCard total={total} />
      <ReportSection title="Суммы по валютам" note={`Валют: ${currenciesCount}`}>
        <CurrencyList totalsByCurrency={totalsByCurrency} rates={rates} />
      </ReportSection>
      <RatesSection totalsByCurrency={totalsByCurrency} rates={rates} />
    </Dashboard>
  )
}
