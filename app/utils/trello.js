import R from 'ramda';

import {pathOr, lensPath} from './ramda';

// getCreateList :: Action -> List
const getCreateList = R.converge(
  pathOr,
  [
    R.path( [ 'data', 'list' ] ),
    R.always( [ 'data', 'listAfter' ] ),
    R.identity
  ]
);

// getDeleteList :: Action -> List
const getDeleteList = R.converge(
  pathOr,
  [
    R.path( [ 'data', 'list' ] ),
    R.always( [ 'data', 'listBefore' ] ),
    R.identity
  ]
);

// getCreateActions :: [Action] -> [Action]
const getCreateActions = R.compose(
  R.map( ( action ) => R.set(
    lensPath( [ 'data', 'list' ] ),
    getCreateList( action ),
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
    getDeleteList( action ),
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

// Pattern for list names with WIP: "Production [3]" -> ["Production", " [3]"]
const _parsedNamePattern = /(.*?)(\s\[\d+\])$/;

// parseListName :: String -> [String | Undefined]
const parseListName = R.cond( [
  [
    R.test( _parsedNamePattern ),
    R.compose( R.head, R.tail, R.match( _parsedNamePattern ) )
  ],
  [ R.T, R.identity ]
] );

// getDisplayedLists :: [{name: String}] -> String -> String -> [String]
const getDisplayedLists = ( lists, first, last ) => {
  const names = R.compose( R.map( parseListName ), R.pluck( "name" ) )( lists );
  return R.slice(
    R.indexOf( parseListName( first ), names ),
    R.indexOf( parseListName( last ), names ) + 1 || R.length( lists ),
    names
  );
};

export {
  getCreateList,
  getDeleteList,
  getCreateActions,
  getDeleteActions,
  parseListName,
  getDisplayedLists
};
