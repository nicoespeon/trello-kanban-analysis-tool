import { test } from 'tape';

import {
  argsToArray,
} from '../function';

test('argsToArray', (assert) => {
  assert.deepEquals(
    argsToArray(1, 'lorem', 3),
    [1, 'lorem', 3],
    'should convert arguments into an array'
  );
  assert.end();
});
