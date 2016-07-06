import { test } from 'tape';

import {
  round,
} from '../number';

test('round', (assert) => {
  assert.equals(round(12.18653), 12.19, 'should round given float to the second decimal');
  assert.equals(round(12.18353), 12.18, 'should round to the floor when appropriate');
  assert.equals(round(12), 12, 'should not change given integer');
  assert.equals(round(-12.1827), -12.18, 'should deal with negatives');
  assert.equals(round(12.1), 12.1, 'should not change floats that have less than 2 decimals');
  assert.end();
});
