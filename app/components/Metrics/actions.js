import R from 'ramda';

import {
  hasSkippedList,
  getUpdatedLists,
  splitToPairs,
} from './lists';

// setMoveActionLists :: Action -> [String, String] -> Action
const setMoveActionLists = R.curry((action, lists) => R.compose(
  R.set(R.lensPath(['data', 'listAfter', 'id']), R.last(lists)),
  R.set(R.lensPath(['data', 'listBefore', 'id']), R.head(lists))
)(action));

// getDetailedMoveAction :: [String] -> Action -> [Action]
const getDetailedMoveAction = R.curry((lists, action) => R.compose(
  R.map(setMoveActionLists(action)),
  R.reverse,
  splitToPairs,
  getUpdatedLists(action)
)(lists));

// consolidateSkippedLists :: [String] -> [Action] -> [Action]
const consolidateSkippedLists = (lists) => R.compose(
  R.flatten,
  R.map(
    R.cond([
      [hasSkippedList(lists), getDetailedMoveAction(lists)],
      [R.T, R.identity],
    ])
  )
);

// consolidateActions :: [Action] -> [[Action]] -> [String] -> [Action]
const consolidateActions = (actions, complementaryActions, lists) => R.compose(
  consolidateSkippedLists(lists),
  R.useWith(R.concat, [R.identity, R.flatten])
)(actions, complementaryActions);

export {
  setMoveActionLists,
  getDetailedMoveAction,
  consolidateSkippedLists,
  consolidateActions,
};
