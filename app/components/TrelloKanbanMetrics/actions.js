import R from 'ramda';

import { lensPath } from '../../utils/ramda';
import { splitToPairs } from './lists';

// getNext :: [String] -> String -> String
const getNext = (lists, value) => R.compose(
  R.defaultTo(null),
  R.cond([
    // Return `null` if not found.
    [R.equals(-1), R.always(null)],
    [R.T, R.compose(R.nth(R.__, lists), R.inc)],
  ]),
  R.findIndex(R.equals(value))
)(lists);

// listAfterIdEquals :: Action -> a -> Boolean
const listAfterIdEquals = R.pathEq(['data', 'listAfter', 'id']);

// listBeforeId :: Action -> a
const listBeforeId = R.path(['data', 'listBefore', 'id']);

// listAfterId :: Action -> a
const listAfterId = R.path(['data', 'listAfter', 'id']);

// hasSkippedList :: [String] -> Action -> Boolean
const hasSkippedList = R.curry((lists, action) => R.cond([
  // No listAfter ID = this is not a movement action = false.
  [listAfterIdEquals(undefined), R.F],
  [
    R.T,
    R.compose(
      R.not,
      listAfterIdEquals(
        getNext(lists, listBeforeId(action))
      )
    ),
  ],
])(action));

// findIndexWhereEquals :: a -> [a] -> Number
const findIndexWhereEquals = R.compose(R.findIndex, R.equals);

// getUpdatedLists :: Action -> [String] -> [String]
const getUpdatedLists = (action) => R.converge(
  R.slice,
  [
    findIndexWhereEquals(listBeforeId(action)),
    R.compose(
      R.inc,
      findIndexWhereEquals(listAfterId(action))
    ),
    R.identity,
  ]
);

// setMoveActionLists :: Action -> [String, String] -> Action
const setMoveActionLists = R.curry((action, lists) => R.compose(
  R.set(lensPath(['data', 'listAfter', 'id']), R.last(lists)),
  R.set(lensPath(['data', 'listBefore', 'id']), R.head(lists))
)(action));

// getDetailedMoveAction :: [String] -> Action -> [Action]
const getDetailedMoveAction = R.curry((lists, action) => R.compose(
  R.map(setMoveActionLists(action)),
  R.reverse,
  splitToPairs,
  getUpdatedLists(action)
)(lists));

export {
  getNext,
  hasSkippedList,
  getUpdatedLists,
  setMoveActionLists,
  getDetailedMoveAction,
};
