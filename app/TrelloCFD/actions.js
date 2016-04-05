import R from 'ramda';

import {
  groupByWith,
  sortByDateDesc,
  uniqByDateDesc,
  fillMissingDates,
  parseDate,
  lensPath,
  pathOr
} from '../utils/utils';

import {sumNumberOfCards} from './cards';
import {countCardsPerList, mapListData, parseListName} from './lists';

// _parseActionsWith :: (Number -> b) -> [Action] -> [List]
function _parseActionsWith ( fn ) {
  return R.compose(
    groupByWith(
      R.prop( 'date' ),
      ( a, b ) => ({
        date: a,
        content: R.compose( countCardsPerList( fn ), mapListData )( b )
      })
    ),
    R.map( R.over( R.lensProp( 'date' ), parseDate ) )
  );
}

// Create actions are counted as negative delta, delete actions as positive.
// This is because we reverse engineer the number of cards, consolidating data
// going back through time, starting from today.

// parseCreateActions :: [Action] -> [List]
const parseCreateActions = _parseActionsWith( R.negate );

// parseDeleteActions :: [Action] -> [List]
const parseDeleteActions = _parseActionsWith( R.identity );

// getCreateActions :: [Action] -> [Action]
const getCreateActions = R.compose(
  R.map( ( action ) => R.set(
    lensPath( [ 'data', 'list' ] ),
    pathOr( R.path( [ 'data', 'list' ] )( action ), [ 'data', 'listAfter' ], action ),
    action
  ) ),
  R.filter(
    R.either(
      R.propEq( 'type', 'createCard' ),
      R.both(
        R.propEq( 'type', 'updateCard' ),
        R.path( [ 'data', 'listAfter' ] )
      )
    )
  )
);

// getDeleteActions :: [Action] -> [Action]
const getDeleteActions = R.compose(
  R.map( ( action ) => R.set(
    lensPath( [ 'data', 'list' ] ),
    pathOr( R.path( [ 'data', 'list' ] )( action ), [ 'data', 'listBefore' ], action ),
    action
  ) ),
  R.filter(
    R.either(
      R.propEq( 'type', 'deleteCard' ),
      R.both(
        R.propEq( 'type', 'updateCard' ),
        R.either(
          R.path( [ 'data', 'listBefore' ] ),
          R.compose( R.equals( true ), R.path( [ 'data', 'card', 'closed' ] ) )
        )
      )
    )
  )
);

// parseCreateActionsFrom :: [Action] -> [List]
const parseCreateActionsFrom = R.compose( parseCreateActions, getCreateActions );

// parseDeleteActionsFrom :: [Action] -> [List]
const parseDeleteActionsFrom = R.compose( parseDeleteActions, getDeleteActions );

// consolidateContent :: [{list: String, numberOfCards: Number}] -> [{list: String, numberOfCards: Number}]
const consolidateContent = groupByWith(
  R.prop( 'list' ),
  ( a, b ) => ({ list: a, numberOfCards: sumNumberOfCards( b ) })
);

// consolidateActions :: [{list: String, numberOfCards: Number}] -> [List] -> [List]
const consolidateActions = ( initialContent, actions ) => {
  return R.compose(
    fillMissingDates,
    R.map(
      R.over(
        R.lensProp( 'content' ),
        R.map(
          R.over( R.lensProp( 'list' ), parseListName )
        )
      )
    ),
    uniqByDateDesc,
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
  parseActions
};
