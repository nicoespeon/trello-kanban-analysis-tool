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

export {
  getNext,
};
