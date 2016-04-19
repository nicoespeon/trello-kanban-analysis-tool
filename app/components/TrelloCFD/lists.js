import R from 'ramda';

import {countByWith} from '../../utils/utility';

// allLists :: [List] -> [String]
const allLists = R.compose(
  R.uniq,
  R.flatten,
  R.map( R.pluck( 'list' ) ),
  R.reject( R.isNil ),
  R.pluck( 'content' )
);

// countCardsPerList :: (Number -> b) -> [{id: String}] -> [{ list: String, numberOfCards: b }]
const countCardsPerList = R.curry( function ( fn, data ) {
  return countByWith(
    R.prop( 'id' ),
    ( a, b ) => ({ list: a, numberOfCards: fn( b ) }),
    data
  );
} );

// mapListData :: [{data: {list: a}}] -> [a]
const mapListData = R.map( R.path( [ 'data', 'list' ] ) );

export {
  allLists, 
  countCardsPerList, 
  mapListData
};
