import { API_KEY } from './constants.js';

export const fetchData = async (url, options = {}) => {
  const { headers, withApiKey = true, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: { ...(withApiKey && { 'x-api-key': API_KEY }), ...headers },
  });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  return response.json();
};
