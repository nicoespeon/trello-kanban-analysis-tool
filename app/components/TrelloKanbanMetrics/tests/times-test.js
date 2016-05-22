import { test } from 'tape';

import trelloActions from './fixtures/trello-actions';

import {
  parseStartDates,
  filterCardsOnPeriod,
  leadTimeFromDates,
  parseLeadTime,
  avgLeadTime,
  isMissingInformation,
} from '../times';

test('parseStartDates', (assert) => {
  const expected = [
    {
      id: '5661abfe6c2f11e4db652169',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-10' },
        { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '564077e6e6dfdc9c01244836',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-06' },
        { list: '53a775adc6ff397a74274486', date: '2016-04-06' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-12' },
      ],
    },
    {
      id: '570768ca19fde6c4a98714b5',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: null },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '56fb8a5af196e52193de6179',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-04-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-07' },
      ],
    },
    {
      id: '56f3e734a5ab9295bcdb29d6',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-07' },
        { list: '53a775adc6ff397a74274486', date: null },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '56f2a2265985b75e2c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-23' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-12' },
      ],
    },
    {
      id: '56dc003c5a0885d45c5f5ca4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-02-08' },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
  ];
  const lists = [
    '563b1afeb758fc0e81a3c1b6',
    '53a775adc6ff397a74274486',
    '5450ed6ad166fa6110790030',
  ];

  assert.deepEquals(
    parseStartDates(trelloActions, lists),
    expected,
    'should parse actions with given lists to determine start dates'
  );
  assert.deepEquals(
    parseStartDates(trelloActions)(lists),
    expected,
    'should be curried'
  );
  assert.end();
});

test('filterCardsOnPeriod', (assert) => {
  const data = [
    {
      id: '5661abfe6c2f11e4db652169',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-10' },
        { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '564077e6e6dfdc9c01244836',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-06' },
        { list: '53a775adc6ff397a74274486', date: '2016-04-06' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-12' },
      ],
    },
    {
      id: '570768ca19fde6c4a98714b5',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: null },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '56fb8a5af196e52193de6179',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-04-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-07' },
      ],
    },
    {
      id: '56f3e734a5ab9295bcdb29d6',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-07' },
        { list: '53a775adc6ff397a74274486', date: null },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
    {
      id: '56f2a2265985b75e2c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-23' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-12' },
      ],
    },
    {
      id: '56f2a2265985b7599c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-24' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-09' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-10' },
      ],
    },
    {
      id: '56dc003c5a0885d45c5f5ca4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-02-08' },
        { list: '5450ed6ad166fa6110790030', date: null },
      ],
    },
  ];
  const expected = [
    {
      id: '56fb8a5af196e52193de6179',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-04-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-07' },
      ],
    },
    {
      id: '56f2a2265985b75e2c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-23' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-12' },
      ],
    },
  ];
  const dates = { startDate: '2016-02-12', endDate: '2016-04-07' };

  const expectedWithNullEnd = [
    {
      id: '564077e6e6dfdc9c01244836',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-04-06' },
        { list: '53a775adc6ff397a74274486', date: '2016-04-06' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-12' },
      ],
    },
    {
      id: '56fb8a5af196e52193de6179',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-04-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-07' },
      ],
    },
    {
      id: '56f2a2265985b75e2c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-23' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-12' },
      ],
    },
  ];
  const datesWithNullEnd = { startDate: '2016-02-12', endDate: null };

  const expectedWithNullStart = [
    {
      id: '56fb8a5af196e52193de6179',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: null },
        { list: '53a775adc6ff397a74274486', date: '2016-04-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-04-07' },
      ],
    },
    {
      id: '56f2a2265985b75e2c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-23' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-07' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-12' },
      ],
    },
    {
      id: '56f2a2265985b7599c6e59c4',
      startDates: [
        { list: '563b1afeb758fc0e81a3c1b6', date: '2016-01-24' },
        { list: '53a775adc6ff397a74274486', date: '2016-02-09' },
        { list: '5450ed6ad166fa6110790030', date: '2016-02-10' },
      ],
    },
  ];
  const datesWithNullStart = { startDate: null, endDate: '2016-04-07' };

  const dataWithoutStartDates = [{
    id: '5661abfe6c2f11e4db652169',
    startDates: [],
  }];

  assert.deepEquals(
    filterCardsOnPeriod(dates, data),
    expected,
    'should return cards that count for selected period lead time calculation'
  );
  assert.deepEquals(
    filterCardsOnPeriod(dates, []),
    [],
    'should return an empty object if data are empty'
  );
  assert.deepEquals(
    filterCardsOnPeriod(dates, dataWithoutStartDates),
    [],
    'should omit cards without start dates'
  );
  assert.deepEquals(
    filterCardsOnPeriod(dates)(data),
    expected, 'should be curried');
  assert.deepEquals(
    filterCardsOnPeriod(datesWithNullEnd, data),
    expectedWithNullEnd,
    'should take all cards after startDate if endDate is null'
  );
  assert.deepEquals(
    filterCardsOnPeriod(datesWithNullStart, data),
    expectedWithNullStart,
    'should take all cards before endDate if startDate is null'
  );
  assert.end();
});

test('leadTimeFromDates', (assert) => {
  const dates = [
    { list: 'Backlog', date: '2016-04-01' },
    { list: 'Card Preparation [2]', date: '2016-04-01' },
    { list: 'Production [3]', date: '2016-04-02' },
    { list: 'Tests QA [2]', date: '2016-04-05' },
    { list: 'Mise en live [1]', date: '2016-04-05' },
    { list: 'In Production', date: '2016-04-06' },
    { list: 'Live (April 2016)', date: '2016-04-08' },
  ];
  const datesWithStartingNulls = [
    { list: 'Backlog', date: null },
    { list: 'Card Preparation [2]', date: null },
    { list: 'Production [3]', date: '2016-04-02' },
    { list: 'Tests QA [2]', date: '2016-04-05' },
    { list: 'Mise en live [1]', date: '2016-04-05' },
    { list: 'In Production', date: '2016-04-06' },
    { list: 'Live (April 2016)', date: '2016-04-08' },
  ];
  const datesWithEndingNulls = [
    { list: 'Backlog', date: '2016-04-01' },
    { list: 'Card Preparation [2]', date: '2016-04-01' },
    { list: 'Production [3]', date: '2016-04-02' },
    { list: 'Tests QA [2]', date: '2016-04-05' },
    { list: 'Mise en live [1]', date: '2016-04-05' },
    { list: 'In Production', date: null },
    { list: 'Live (April 2016)', date: null },
  ];

  assert.equals(
    leadTimeFromDates(dates),
    7,
    'should return the lead time from dates'
  );
  assert.equals(
    leadTimeFromDates(datesWithStartingNulls),
    6,
    'should consider the first non-null date as the start date'
  );
  assert.equals(
    leadTimeFromDates(datesWithEndingNulls),
    null,
    'should return null if last list has no date'
  );
  assert.end();
});

test('parseLeadTime', (assert) => {
  const expected = [
    { id: '18276354', leadTime: 7 },
    { id: '13876354', leadTime: 25 },
    { id: '32876354', leadTime: 30 },
    { id: '13879024', leadTime: null },
    { id: '28776354', leadTime: 16 },
    { id: '34376354', leadTime: null },
  ];
  const data = [
    {
      id: '18276354',
      startDates: [
        { list: 'Backlog', date: '2016-04-01' },
        { list: 'Card Preparation [2]', date: '2016-04-01' },
        { list: 'Production [3]', date: '2016-04-02' },
        { list: 'Tests QA [2]', date: '2016-04-05' },
        { list: 'Mise en live [1]', date: '2016-04-05' },
        { list: 'In Production', date: '2016-04-06' },
        { list: 'Live (April 2016)', date: '2016-04-08' },
      ],
    },
    {
      id: '13876354',
      startDates: [
        { list: 'Backlog', date: '2016-04-01' },
        { list: 'Card Preparation [2]', date: '2016-04-04' },
        { list: 'Production [3]', date: '2016-04-05' },
        { list: 'Tests QA [2]', date: '2016-04-05' },
        { list: 'Mise en live [1]', date: '2016-04-10' },
        { list: 'In Production', date: '2016-04-26' },
        { list: 'Live (April 2016)', date: '2016-04-26' },
      ],
    },
    {
      id: '32876354',
      startDates: [
        { list: 'Backlog', date: null },
        { list: 'Card Preparation [2]', date: null },
        { list: 'Production [3]', date: '2016-04-13' },
        { list: 'Tests QA [2]', date: '2016-05-05' },
        { list: 'Mise en live [1]', date: '2016-05-10' },
        { list: 'In Production', date: '2016-05-11' },
        { list: 'Live (April 2016)', date: '2016-05-13' },
      ],
    },
    {
      id: '13879024',
      startDates: [
        { list: 'Backlog', date: null },
        { list: 'Card Preparation [2]', date: null },
        { list: 'Production [3]', date: '2016-04-05' },
        { list: 'Tests QA [2]', date: '2016-04-05' },
        { list: 'Mise en live [1]', date: '2016-04-10' },
        { list: 'In Production', date: null },
        { list: 'Live (April 2016)', date: null },
      ],
    },
    {
      id: '28776354',
      startDates: [
        { list: 'Backlog', date: '2016-04-09' },
        { list: 'Card Preparation [2]', date: '2016-04-10' },
        { list: 'Production [3]', date: '2016-04-05' },
        { list: 'Tests QA [2]', date: '2016-04-07' },
        { list: 'Mise en live [1]', date: '2016-04-10' },
        { list: 'In Production', date: '2016-04-14' },
        { list: 'Live (April 2016)', date: '2016-04-25' },
      ],
    },
    {
      id: '34376354',
      startDates: [
        { list: 'Backlog', date: '2016-04-01' },
        { list: 'Card Preparation [2]', date: '2016-04-02' },
        { list: 'Production [3]', date: '2016-04-05' },
        { list: 'Tests QA [2]', date: '2016-04-05' },
        { list: 'Mise en live [1]', date: null },
        { list: 'In Production', date: null },
        { list: 'Live (April 2016)', date: null },
      ],
    },
  ];

  const expectedWithoutStartDates = [
    { id: '18276354', leadTime: null },
    { id: '13876354', leadTime: null },
    { id: '32876354', leadTime: null },
  ];
  const dataWithoutStartDates = [
    { id: '18276354', startDates: [] },
    { id: '13876354', startDates: [] },
    { id: '32876354', startDates: [] },
  ];

  assert.deepEquals(
    parseLeadTime(data),
    expected,
    'should parse lead time from given data'
  );
  assert.deepEquals(
    parseLeadTime(dataWithoutStartDates),
    expectedWithoutStartDates,
    'should handled data without start dates'
  );
  assert.end();
});

test('avgLeadTime', (assert) => {
  const dataAvgInteger = [
    { leadTime: 3 },
    { leadTime: 0 },
    { leadTime: 8 },
    { leadTime: null },
    { leadTime: 1 },
    { leadTime: 3 },
  ];
  const dataAvgFloat = [
    { leadTime: 4 },
    { leadTime: 7 },
    { leadTime: null },
    { leadTime: 5 },
    { leadTime: 10 },
    { leadTime: null },
    { leadTime: 2 },
  ];

  assert.equals(
    avgLeadTime(dataAvgInteger),
    3,
    'should return the average lead time from given data'
  );
  assert.equals(
    avgLeadTime(dataAvgFloat),
    6,
    'should return a rounded average lead time'
  );
  assert.end();
});

test('isMissingInformation', (assert) => {
  const card = {
    id: '29876467890',
    startDates: [
      { list: '563b1afeb758fc0e81a3c1b6', date: '2016-03-03' },
      { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
      { list: '5450ed6ad166fa6110790030', date: '2016-05-10' },
    ],
  };
  const cardWithoutStart = {
    id: '29876467890',
    startDates: [
      { list: '563b1afeb758fc0e81a3c1b6', date: null },
      { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
      { list: '5450ed6ad166fa6110790030', date: '2016-05-10' },
    ],
  };
  const cardWithoutEnd = {
    id: '29876467890',
    startDates: [
      { list: '563b1afeb758fc0e81a3c1b6', date: '2016-03-03' },
      { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
      { list: '5450ed6ad166fa6110790030', date: null },
    ],
  };
  const cardWithoutStartNorEnd = {
    id: '29876467890',
    startDates: [
      { list: '563b1afeb758fc0e81a3c1b6', date: '2016-03-03' },
      { list: '53a775adc6ff397a74274486', date: '2016-05-06' },
      { list: '5450ed6ad166fa6110790030', date: null },
    ],
  };
  const cardWithoutDates = {
    id: '29876467890',
    startDates: [],
  };

  assert.equals(
    isMissingInformation(card),
    false,
    'should return false if given card is complete'
  );
  assert.equals(
    isMissingInformation(cardWithoutStart),
    true,
    'should return true if given card has no information on first start dates'
  );
  assert.equals(
    isMissingInformation(cardWithoutEnd),
    false,
    'should return false if card has not completed its cycle'
  );
  assert.equals(
    isMissingInformation(cardWithoutStartNorEnd),
    false,
    'should return false if card has no info on first start dates and has not completed its cycle'
  );
  assert.equals(
    isMissingInformation(cardWithoutDates),
    false,
    'should return false if given card has no dates'
  );
  assert.end();
});
