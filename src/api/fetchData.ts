import { API_KEY } from '@config/constants';

type FetchDataOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  withApiKey?: boolean;
};

export const fetchData = async (url: string, options: FetchDataOptions = {}): Promise<unknown> => {
  const { headers, withApiKey = true, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers: { ...(withApiKey ? { 'x-api-key': API_KEY } : {}), ...headers },
  });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  return response.json();
};
