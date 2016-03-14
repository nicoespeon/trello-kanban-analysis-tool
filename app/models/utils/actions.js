import R from 'ramda';

import {groupByWith, parseDate} from '../../utils/utils';
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
const getCreateActions = R.filter( R.propEq( 'type', 'createCard' ) );

// getDeleteActions :: [Action] -> [Action]
const getDeleteActions = R.filter(
  R.either(
    R.propEq( 'type', 'deleteCard' ),
    R.propEq( 'type', 'updateCard' )
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
