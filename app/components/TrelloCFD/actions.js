import R from 'ramda';

import {
  groupByWith,
  sortByDateDesc,
  uniqByDateDesc,
  fillMissingDates,
  parseDate,
  getCreateActions,
  getDeleteActions,
} from '../../utils/utils';

import { sumNumberOfCards } from './cards';
import { countCardsPerList, mapListData } from './lists';

// parseActionsWith :: (Number -> b) -> [Action] -> [List]
function parseActionsWith(fn) {
  return R.compose(
    groupByWith(
      R.prop('date'),
      (a, b) => ({
        date: a,
        content: R.compose(countCardsPerList(fn), mapListData)(b),
      })
    ),
    R.map(R.over(R.lensProp('date'), parseDate))
  );
}

// Create actions are counted as negative delta, delete actions as positive.
// This is because we reverse engineer the number of cards, consolidating data
// going back through time, starting from today.

// parseCreateActions :: [Action] -> [List]
const parseCreateActions = parseActionsWith(R.negate);

// parseDeleteActions :: [Action] -> [List]
const parseDeleteActions = parseActionsWith(R.identity);

// parseCreateActionsFrom :: [Action] -> [List]
const parseCreateActionsFrom = R.compose(parseCreateActions, getCreateActions);

// parseDeleteActionsFrom :: [Action] -> [List]
const parseDeleteActionsFrom = R.compose(parseDeleteActions, getDeleteActions);

// CardsList = {list: String, numberOfCards: Number}
// consolidateContent :: [CardsList] -> [CardsList]
const consolidateContent = groupByWith(
  R.prop('list'),
  (a, b) => ({ list: a, numberOfCards: sumNumberOfCards(b) })
);

// consolidateActions :: [CardsList] -> [List] -> [List]
const consolidateActions = (initialContent, actions) => R.compose(
    fillMissingDates,
    uniqByDateDesc,
    R.scan(
      (a, b) => R.over(
        R.lensProp('content'),
        R.compose(consolidateContent, R.concat(R.prop('content', a))),
        b
      ),
      initialContent
    ),
    sortByDateDesc
  )(actions);

// parseCurrentStatus :: String -> [{id: String, cards: Array}] -> [List]
const parseCurrentStatus = R.curry((date, list) => ({
  date,
  content: R.compose(
    R.unary(R.reverse),
    R.map(a => ({ list: a.id, numberOfCards: R.length(a.cards) }))
  )(list),
}));

// parseActions :: String -> [{id: String, cards: Array}] -> [Action] -> [List]
const parseActions = R.curry((date, lists, actions) => consolidateActions(
    parseCurrentStatus(date, lists),
    R.concat(
      parseCreateActionsFrom(actions),
      parseDeleteActionsFrom(actions)
    )
  )
);

export {
  parseCreateActions,
  parseDeleteActions,
  getCreateActions,
  getDeleteActions,
  parseCreateActionsFrom,
  parseDeleteActionsFrom,
  consolidateContent,
  consolidateActions,
  parseCurrentStatus,
  parseActions,
};
