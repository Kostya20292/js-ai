import type { AppRoute, Report as ReportData } from '@types';
import { AppNav } from '@components/AppNav/AppNav';
import { CurrencyList } from '@components/CurrencyList/CurrencyList';
import { Dashboard } from '@components/Dashboard/Dashboard';
import { PageHeader } from '@components/PageHeader/PageHeader';
import { RatesSection } from '@components/RatesSection/RatesSection';
import { ReportSection } from '@components/ReportSection/ReportSection';
import { TotalCard } from '@components/TotalCard/TotalCard';

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
