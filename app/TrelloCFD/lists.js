import R from 'ramda';

import {countByWith} from '../utils/utils';

// Pattern for list names with WIP: "Production [3]" -> ["Production", " [3]"]
const _parsedNamePattern = /(.*?)(\s\[\d+\])$/;

// allLists :: [List] -> [String]
const allLists = R.compose(
  R.uniq,
  R.flatten,
  R.map( R.pluck( 'list' ) ),
  R.reject( R.isNil ),
  R.pluck( 'content' )
);

// countCardsPerList :: (Number -> b) -> [{name: String}] -> [{ list: String, numberOfCards: b }]
const countCardsPerList = R.curry( function ( fn, data ) {
  return countByWith(
    R.prop( 'name' ),
    ( a, b ) => ({ list: a, numberOfCards: fn( b ) }),
    data
  );
} );

// mapListData :: [{data: {list: a}}] -> [a]
const mapListData = R.map( R.path( [ 'data', 'list' ] ) );

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
  allLists, 
  countCardsPerList, 
  mapListData,
  parseListName,
  getDisplayedLists
};
