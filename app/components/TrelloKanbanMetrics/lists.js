import R from 'ramda';

// splitToPairs :: [String] -> [[String]]
const splitToPairs = R.compose(
  R.splitEvery(2),
  R.init,
  R.tail,
  R.chain(n => [n, n])
);

export { splitToPairs };
