import R from 'ramda';

import {groupByWith, sortByDate, uniqByDateLast} from '../utils/utils';
import {parseCreateActionsFrom, parseDeleteActionsFrom} from './utils/actions';

// sumNumberOfCards :: [{numberOfCards: Number}] -> Number
const sumNumberOfCards = R.compose(
  R.sum,
  R.reject( R.isNil ),
  R.pluck( 'numberOfCards' )
);

// consolidateContent :: [{list: String, numberOfCards: Number}] -> [{list: String, numberOfCards: Number}]
const consolidateContent = groupByWith(
  R.prop( 'list' ),
  ( a, b ) => ({ list: a, numberOfCards: sumNumberOfCards( b ) })
);

// consolidateActions :: [List] -> [List]
const consolidateActions = R.compose(
  R.tail,
  uniqByDateLast,
  R.scan(
    ( a, b ) => {
      const scanContent = R.compose(
        consolidateContent,
        R.concat( R.prop( 'content', a ) )
      );
      return R.over( R.lensProp( 'content' ), scanContent, b );
    },
    { content: [] }
  ),
  sortByDate
);

// parseActions :: [Action] -> [List]
function parseActions ( actions ) {
  return consolidateActions(
    R.concat(
      parseCreateActionsFrom( actions ),
      parseDeleteActionsFrom( actions )
    )
  );
}

export {sumNumberOfCards, consolidateContent, consolidateActions, parseActions};
