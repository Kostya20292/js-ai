import { useEffect, useState } from 'react';
import { loadReport } from '@services/loadReport';
import type { ReportState } from '@types';

export const useDailyRevenue = () => {
  const [state, setState] = useState<ReportState>({ status: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setState({ status: 'loading' });

      try {
        const report = await loadReport();

        if (isActive) {
          setState({ status: 'success', report });
        }
      } catch (error) {
        console.error(error);

        if (isActive) {
          setState({ status: 'error' });
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [reloadToken]);

  const handleReload = () => setReloadToken((token) => token + 1);

  return { state, handleReload };
};
