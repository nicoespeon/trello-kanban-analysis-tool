import { test } from 'tape';

import { sumNumberOfCards } from '../cards';

test('sumNumberOfCards', (assert) => {
  const result = sumNumberOfCards([
    { numberOfCards: 1 },
    { list: 'Backlog', numberOfCards: 3 },
    { numberOfCards: 4 },
    { total: 4 },
    { numberOfCards: 0 },
    { numberOfCards: 1 },
  ]);

  assert.equals(result, 9, 'should sum all numberOfCards from collection');
  assert.end();
});
