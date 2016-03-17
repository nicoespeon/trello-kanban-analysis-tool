import R from 'ramda';

import {groupByWith, parseDate, lensPath, pathOr} from '../../utils/utils';
import {countCardsPerList, mapListData} from './lists';

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

// parseCreateActions :: [Action] -> [List]
const parseCreateActions = _parseActionsWith( R.identity );

// parseDeleteActions :: [Action] -> [List]
const parseDeleteActions = _parseActionsWith( R.negate );

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
      R.propEq( 'type', 'updateCard' )
    )
  )
);

// parseCreateActionsFrom :: [Action] -> [List]
const parseCreateActionsFrom = R.compose( parseCreateActions, getCreateActions );

// parseDeleteActionsFrom :: [Action] -> [List]
const parseDeleteActionsFrom = R.compose( parseDeleteActions, getDeleteActions );

export {
  parseCreateActions,
  parseDeleteActions,
  getCreateActions,
  getDeleteActions,
  parseCreateActionsFrom,
  parseDeleteActionsFrom
};
