import type { AppRoute, Report as ReportData } from '../../types';
import { AppNav } from '../AppNav/AppNav';
import { CurrencyList } from '../CurrencyList/CurrencyList';
import { Dashboard } from '../Dashboard/Dashboard';
import { PageHeader } from '../PageHeader/PageHeader';
import { RatesSection } from '../RatesSection/RatesSection';
import { ReportSection } from '../ReportSection/ReportSection';
import { TotalCard } from '../TotalCard/TotalCard';

type ReportProps = {
  currentRoute: AppRoute;
  handleNavigate: (route: AppRoute) => void;
  report: ReportData;
  handleRefresh: () => void;
};

export const Report = ({ currentRoute, handleNavigate, report, handleRefresh }: ReportProps) => {
  const { totalsByCurrency, rates, total } = report;
  const currenciesCount = Object.keys(totalsByCurrency).length;

  return (
    <Dashboard>
      <AppNav currentRoute={currentRoute} handleNavigate={handleNavigate} />
      <PageHeader handleRefresh={handleRefresh} />
      <TotalCard total={total} />
      <ReportSection title="Суммы по валютам" note={`Валют: ${currenciesCount}`}>
        <CurrencyList totalsByCurrency={totalsByCurrency} rates={rates} />
      </ReportSection>
      <RatesSection totalsByCurrency={totalsByCurrency} rates={rates} />
    </Dashboard>
  );
};
