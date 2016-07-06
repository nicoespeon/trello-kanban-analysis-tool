import { test } from 'tape';

import {
  countByWith,
} from '../relation';

test('countByWith', (assert) => {
  const data = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
  const fn = (a, b) => ({ number: a, count: b });

  const expected = [
    { number: '1', count: 3 },
    { number: '2', count: 2 },
    { number: '3', count: 1 },
  ];
  const result = countByWith(Math.floor, fn, data);
  const resultCurried1 = countByWith(Math.floor, fn);
  const resultCurried2 = countByWith(Math.floor);

  assert.looseEquals(
    expected,
    result,
    'should return a collection of counted parsed objects'
  );
  assert.looseEquals(
    expected,
    resultCurried1(data),
    'should work if we pass last argument later'
  );
  assert.looseEquals(
    expected,
    resultCurried2(fn)(data),
    'should work if we pass arguments one by one'
  );

  assert.end();
});
