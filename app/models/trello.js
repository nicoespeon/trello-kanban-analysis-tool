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

// consolidateContentWith :: {list: String, numberOfCards: Number} -> [{list: String, numberOfCards: Number}]
const consolidateContentWith = ( a ) => R.compose(
  consolidateContent,
  R.concat( propContent( a ) )
);

// consolidateActions :: [{list: String, numberOfCards: Number}] -> [List] -> [List]
const consolidateActions = function ( initialContent, actions ) {
  return R.compose(
    R.unary( R.reverse ),
    R.tail,
    uniqByDateLast,
    R.scan(
      ( a, b ) => R.cond( [
        // For first date operations, consider initial content.
        [
          R.either(
            R.compose( R.isNil, propDate ),
            R.both(
              R.compose( R.equals( propDate( b ) ), propDate ),
              R.compose( R.equals( initialContent ), propContent )
            )
          ),
          ( a ) => R.set( R.lensProp( 'content' ), propContent( a ), b )
        ],
        // Otherwise, concatenate previous content (a) with next operation (b).
        [
          R.T,
          ( a ) => R.over( R.lensProp( 'content' ), consolidateContentWith( a ), b )
        ]
      ] )( a ),
      { content: initialContent }
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
