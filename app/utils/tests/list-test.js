import { test } from 'tape';
import R from 'ramda';

import {
  groupByWith,
} from '../list';

test('groupByWith', (assert) => {
  const fn = (a, b) => ({ grade: a, list: b });
  const data = [
    { grade: 'A', name: 'Aby' },
    { grade: 'A', name: 'Georges' },
    { grade: 'B', name: 'Pascal' },
    { grade: 'A', name: 'Freddy' },
    { grade: 'C', name: 'Nick' },
    { grade: 'C', name: 'Jane' },
  ];

  const expected = [
    {
      grade: 'A',
      list: [
        { grade: 'A', name: 'Aby' },
        { grade: 'A', name: 'Georges' },
        { grade: 'A', name: 'Freddy' },
      ],
    },
    {
      grade: 'B',
      list: [{ grade: 'B', name: 'Pascal' }],
    },
    {
      grade: 'C',
      list: [
        { grade: 'C', name: 'Nick' },
        { grade: 'C', name: 'Jane' },
      ],
    },
  ];

  assert.looseEquals(
    groupByWith(R.prop('grade'), fn, data),
    expected,
    'should return a collection of grouped parsed objects'
  );
  assert.looseEquals(
    groupByWith(R.prop('grade'), fn)(data),
    expected,
    'should work if we pass last argument later'
  );
  assert.looseEquals(
    groupByWith(R.prop('grade'))(fn)(data),
    expected,
    'should work if we pass arguments one by one'
  );
  assert.looseEquals(
    groupByWith(R.prop('grade'), fn, {}),
    [],
    'should return an empty array if data is an object'
  );

  assert.end();
});
