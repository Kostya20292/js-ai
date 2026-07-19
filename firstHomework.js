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

const parseAmountString = (value) => {
  const [amount, currency] = value.trim().split(' ');

  return { amount: Number(amount), currency };
};

const calculateDailyRevenue = (firstSource, secondSource) => {
  let total = 0;
  let currency = '';

  firstSource.transactions.forEach((transaction) => {
    if (transaction.type !== 'paid') {
      return;
    }

    total += transaction.amount;
    currency = transaction.currency;
  });

  secondSource.forEach((value) => {
    const { amount, currency: itemCurrency } = parseAmountString(value);

    total += amount;

    if (!currency) {
      currency = itemCurrency;
    }
  });

  return { total, currency };
};

console.log(calculateDailyRevenue(FirstSource, SecondSource));
