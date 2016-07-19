import { test } from 'tape';

import { getHead, getBody, graphToCSV } from '../csv';

test('getHead', (assert) => {
  const data = [
    {
      key: 'Card Preparation',
      values: [
        [new Date('2016-01-20').getTime(), 1],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 1],
        [new Date('2016-03-02').getTime(), 2],
      ],
    },
    {
      key: 'Backlog',
      values: [
        [new Date('2016-01-20').getTime(), 0],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 2],
        [new Date('2016-03-02').getTime(), 4],
      ],
    },
  ];
  const expected = [
    ['', '2016-01-20', '2016-02-04', '2016-02-08', '2016-03-02'],
  ];

  assert.deepEquals(
    getHead(data),
    expected,
    'should return a properly formatted CSV head from graph data'
  );
  assert.deepEquals(
    getHead([]),
    [['']],
    'should return an array of a single empty string if no data are present'
  );
  assert.end();
});

test('getBody', (assert) => {
  const data = [
    {
      key: 'Card Preparation',
      values: [
        [new Date('2016-01-20').getTime(), 1],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 1],
        [new Date('2016-03-02').getTime(), 2],
      ],
    },
    {
      key: 'Backlog',
      values: [
        [new Date('2016-01-20').getTime(), 0],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 2],
        [new Date('2016-03-02').getTime(), 4],
      ],
    },
  ];
  const expected = [
    ['Card Preparation', 1, 1, 1, 2],
    ['Backlog', 0, 1, 2, 4],
  ];

  assert.deepEquals(
    getBody(data),
    expected,
    'should return a properly formatted CSV body from graph data'
  );
  assert.end();
});

test('graphToCSV', (assert) => {
  const data = [
    {
      key: 'Card Preparation',
      values: [
        [new Date('2016-01-20').getTime(), 1],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 1],
        [new Date('2016-03-02').getTime(), 2],
      ],
    },
    {
      key: 'Backlog',
      values: [
        [new Date('2016-01-20').getTime(), 0],
        [new Date('2016-02-04').getTime(), 1],
        [new Date('2016-02-08').getTime(), 2],
        [new Date('2016-03-02').getTime(), 4],
      ],
    },
  ];
  const expected = [
    ['', '2016-01-20', '2016-02-04', '2016-02-08', '2016-03-02'],
    ['Card Preparation', 1, 1, 1, 2],
    ['Backlog', 0, 1, 2, 4],
  ];

  assert.deepEquals(
    graphToCSV(data),
    expected,
    'should parse graph data into proper CSV format from graph data'
  );
  assert.deepEquals(
    graphToCSV([]),
    [['']],
    'should return an array of a single empty string if no data are present'
  );
  assert.end();
});
