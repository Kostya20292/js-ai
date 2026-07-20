const FirstSource = {
  transactions: [
    {
      type: 'paid',
      amount: 100,
      currency: 'USD',
    },

    {
      type: 'pending',
      amount: 50,
      currency: 'USD',
    },

    {
      type: 'paid',
      amount: 880,
      currency: 'USD',
    },

    {
      type: 'paid',
      amount: 130,
      currency: 'USD',
    },

    {
      type: 'rejected',
      amount: 560,
      currency: 'USD',
    },
  ],

  address: {
    city: 'New York',
    street: '5th Avenue',
    houseNumber: 10,
  },
};

const SecondSource = ['300 USD', '150 USD', '200 USD', '400 USD'];

const AMOUNT_STRING_RE = /^(\d[\d.,]*)\s*([A-Za-z]{3})$/;

const parseAmountString = (value) => {
  const match = String(value).trim().match(AMOUNT_STRING_RE);
  if (!match) {
    throw new Error(`Invalid amount string: ${value}`);
  }
  return {
    amount: Number(match[1].replace(/,/g, '')),
    currency: match[2].toUpperCase(),
  };
};

const normalizeEntry = (amount, currency) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  if (typeof currency !== 'string' || !currency.trim()) {
    throw new Error(`Invalid currency: ${currency}`);
  }
  return { amount: numericAmount, currency: currency.trim().toUpperCase() };
};

const calculateDailyRevenue = (firstSource, secondSource) => {
  if (!firstSource || !secondSource) {
    throw new Error('Both sources are required');
  }
  if (!Array.isArray(firstSource.transactions)) {
    throw new Error('firstSource.transactions must be an array');
  }
  if (!Array.isArray(secondSource)) {
    throw new Error('secondSource must be an array');
  }

  const fromFirst = firstSource.transactions
    .filter((t) => t.type === 'paid')
    .map((t) => normalizeEntry(t.amount, t.currency));

  const fromSecond = secondSource
    .map(parseAmountString)
    .map((entry) => normalizeEntry(entry.amount, entry.currency));

  const all = [...fromFirst, ...fromSecond];

  if (all.length === 0) {
    return { total: 0, currency: null };
  }

  const { currency } = all[0];
  const mixed = all.find((entry) => entry.currency !== currency);
  if (mixed) {
    throw new Error(`Mixed currencies are not supported: ${currency} and ${mixed.currency}`);
  }

  const total = all.reduce((sum, entry) => sum + entry.amount, 0);

  return { total, currency };
};

console.log(calculateDailyRevenue(FirstSource, SecondSource));
