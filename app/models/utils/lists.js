import R from 'ramda';

import {countByWith} from '../../utils/utils';

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

export {countCardsPerList, mapListData};
