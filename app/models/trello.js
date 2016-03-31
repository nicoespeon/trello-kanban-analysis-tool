import R from 'ramda';

import {
  groupByWith,
  sortByDateDesc,
  uniqByDateLast,
  parseListName,
  isNamedContainedIn
} from '../utils/utils';
import {parseCreateActionsFrom, parseDeleteActionsFrom} from './utils/actions';

// propContent :: {content: a} → a | Undefined
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
const consolidateActions = ( initialContent, actions ) => {
  return R.compose(
    R.map(
      R.over(
        R.lensProp( 'content' ),
        R.map(
          R.over( R.lensProp( 'list' ), parseListName )
        )
      )
    ),
    R.unary( R.reverse ),
    uniqByDateLast,
    R.scan(
      ( a, b ) => R.over(
        R.lensProp( 'content' ),
        R.compose( consolidateContent, R.concat( R.prop( 'content', a ) ) ),
        b
      ),
      initialContent
    ),
    sortByDateDesc
  )( actions );
};

// parseCurrentStatus :: String -> [{name: String, cards: Array}] -> [List]
const parseCurrentStatus = R.curry( ( date, list ) => ({
  date: date,
  content: R.compose(
    R.unary( R.reverse ),
    R.map( a => ({ list: a.name, numberOfCards: R.length( a.cards ) }) )
  )( list )
}) );

// parseActions :: String -> [{name: String, cards: Array}] -> [Action] -> [List]
const parseActions = R.curry( ( date, lists, actions ) => {
  return consolidateActions(
    parseCurrentStatus( date, lists ),
    R.concat(
      parseCreateActionsFrom( actions ),
      parseDeleteActionsFrom( actions )
    )
  );
} );

// filterLists :: [String] -> [List] -> [List]
const filterLists = R.curry( ( displayedLists, lists ) => {
  return R.filter( isNamedContainedIn( displayedLists ), lists );
} );

// filterActions :: [String] -> [Action] -> [Action]
const filterActions = R.curry( ( displayedLists, actions ) => {
  return R.filter(
    R.compose(
      isNamedContainedIn( displayedLists ),
      R.cond( [
        [ R.path( [ "data", "listAfter" ] ), R.path( [ "data", "listAfter" ] ) ],
        [ R.path( [ "data", "list" ] ), R.path( [ "data", "list" ] ) ]
      ] )
    ),
    actions
  );
} );

export {
  sumNumberOfCards,
  consolidateContent,
  consolidateActions,
  parseCurrentStatus,
  parseActions,
  filterLists,
  filterActions
};
