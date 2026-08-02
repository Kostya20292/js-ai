import { useEffect, useState } from 'react';
import { DataSources } from '@components/DataSources/DataSources';
import { ErrorState } from '@components/ErrorState/ErrorState';
import { LoadingState } from '@components/LoadingState/LoadingState';
import { Report } from '@components/Report/Report';
import { ROUTE_TITLES } from '@config/constants';
import { useDailyRevenue } from '@hooks/useDailyRevenue';
import type { AppRoute } from '@types';

export const App = () => {
  const [route, setRoute] = useState<AppRoute>('report');
  const { state, handleReload } = useDailyRevenue();

  useEffect(() => {
    document.title = ROUTE_TITLES[route];
  }, [route]);

  const handleNavigate = (nextRoute: AppRoute) => {
    setRoute(nextRoute);
  };

  if (route === 'sources') {
    return <DataSources currentRoute={route} handleNavigate={handleNavigate} />;
  }

  return (
    <>
      {state.status === 'loading' && (
        <LoadingState currentRoute={route} handleNavigate={handleNavigate} />
      )}
      {state.status === 'error' && (
        <ErrorState
          currentRoute={route}
          handleNavigate={handleNavigate}
          handleRetry={handleReload}
        />
      )}
      {state.status === 'success' && (
        <Report
          currentRoute={route}
          handleNavigate={handleNavigate}
          report={state.report}
          handleRefresh={handleReload}
        />
      )}
    </>
  );
};
