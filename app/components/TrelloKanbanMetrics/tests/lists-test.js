import { test } from 'tape';

import { splitToPairs } from '../lists';

test('splitToPairs', (assert) => {
  assert.deepEquals(
    splitToPairs(['Backlog', 'Tests QA', 'Mise en Live', 'Live (2016)']),
    [['Backlog', 'Tests QA'], ['Tests QA', 'Mise en Live'], ['Mise en Live', 'Live (2016)']],
    'should split a collection into pairs'
  );
  assert.deepEquals(
    splitToPairs([]),
    [],
    'should return an empty list if given collection is empty'
  );
  assert.end();
});
