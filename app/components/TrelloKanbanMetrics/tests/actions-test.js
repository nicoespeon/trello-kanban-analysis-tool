import { test } from 'tape';

import {
  getNext,
  hasSkippedList,
  getUpdatedLists,
  setMoveActionLists,
} from '../actions';

test('getNext', (assert) => {
  const lists = ['list-1', 'list-2', 'list-3', 'list-4'];

  assert.equal(
    getNext(lists, 'list-2'),
    'list-3',
    'should return the value that is next to the given one'
  );
  assert.equal(
    getNext(lists, 'list-4'),
    null,
    'should return null if the given value that is the last of the list'
  );
  assert.equal(
    getNext(lists, 'list-8'),
    null,
    'should return null if the given value is not in the list'
  );
  assert.end();
});

test('hasSkippedList', (assert) => {
  const lists = ['list-1', 'list-2', 'list-3', 'list-4'];

  const moveActionSkippingOneList = {
    data: {
      listAfter: { id: 'list-4' },
      listBefore: { id: 'list-2' },
    },
    type: 'updateCard',
  };
  const moveActionSkippingManyLists = {
    data: {
      listAfter: { id: 'list-4' },
      listBefore: { id: 'list-1' },
    },
    type: 'updateCard',
  };
  const moveActionSkippingNoList = {
    data: {
      listAfter: { id: 'list-3' },
      listBefore: { id: 'list-2' },
    },
    type: 'updateCard',
  };
  const createAction = {
    data: { list: { id: 'list-1' } },
    type: 'createCard',
  };

  assert.equal(
    hasSkippedList(lists)(moveActionSkippingOneList),
    true,
    'should return true if given action is a movement that has skipped one list'
  );
  assert.equal(
    hasSkippedList(lists)(moveActionSkippingManyLists),
    true,
    'should return true if given action is a movement that has skipped many lists'
  );
  assert.equal(
    hasSkippedList(lists)(moveActionSkippingNoList),
    false,
    'should return false if given action is a movement that has not skipped any list'
  );
  assert.equal(
    hasSkippedList(lists)(createAction),
    false,
    'should return false if given action is not a movement'
  );
  assert.end();
});

test('getUpdatedLists', (assert) => {
  const action = {
    data: {
      listAfter: { id: 'list-4' },
      listBefore: { id: 'list-2' },
    },
    type: 'updateCard',
  };
  const lists = ['list-1', 'list-2', 'list-3', 'list-4', 'list-5'];

  assert.deepEqual(
    getUpdatedLists(action)(lists),
    ['list-2', 'list-3', 'list-4'],
  'should return lists from the given ones that are updated by the given move action');
  assert.end();
});

test('setMoveActionLists', (assert) => {
  const action = {
    data: {
      listAfter: { id: 'list-3' },
      listBefore: { id: 'list-0' },
    },
    type: 'updateCard',
  };
  const lists = ['list-1', 'list-2'];

  const expected = {
    data: {
      listAfter: { id: 'list-2' },
      listBefore: { id: 'list-1' },
    },
    type: 'updateCard',
  };

  assert.deepEqual(
    setMoveActionLists(action)(lists),
    expected,
    'should return the given action parsed with the given couple of list ids'
  );
  assert.end();
});

