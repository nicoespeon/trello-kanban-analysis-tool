import R from 'ramda';

import {groupByWith, sortByDateDesc, uniqByDateLast} from '../utils/utils';
import {parseCreateActionsFrom, parseDeleteActionsFrom} from './utils/actions';

// propDate :: {date: a} → a | Undefined
const propDate = R.prop( 'date' );

// propContent :: {content: a} → a | Undefined
const propContent = R.prop( 'content' );

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

// consolidateActions :: [{list: String, numberOfCards: Number}] -> [List] -> [List]
const consolidateActions = function ( initialContent, actions ) {
  return R.compose(
    R.unary( R.reverse ),
    uniqByDateLast,
    R.scan(
      ( a, b ) => R.over(
        R.lensProp( 'content' ),
        R.compose( consolidateContent, R.concat( propContent( a ) ) ),
        b
      ),
      initialContent
    ),
    sortByDateDesc
  )( actions );
};

// parseActions :: [{list: String, numberOfCards: Number}] -> [Action] -> [List]
const parseActions = R.curry( ( currentStatus, actions ) => {
  return consolidateActions(
    currentStatus,
    R.concat(
      parseCreateActionsFrom( actions ),
      parseDeleteActionsFrom( actions )
    )
  );
} );

export {sumNumberOfCards, consolidateContent, consolidateActions, parseActions};
