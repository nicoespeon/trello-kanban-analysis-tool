import R from 'ramda';

// argsToArray :: (a, …) -> [a, …]
const argsToArray = R.unapply(R.identity);

export {
  argsToArray,
};
