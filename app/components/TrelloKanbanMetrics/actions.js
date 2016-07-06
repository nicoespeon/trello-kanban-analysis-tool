import R from 'ramda';

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

export {
  getNext,
  hasSkippedList,
  getUpdatedLists,
};
