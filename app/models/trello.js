import R from 'ramda';
import {countByWith, groupByWith} from '../utils/utils';

// countCardsPerList :: [List] -> [List]
const countCardsPerList = countByWith(
  R.prop( 'name' ),
  ( a, b ) => ({ list: a, numberOfCards: b })
);

// parseDate :: String -> String
const parseDate = R.compose( R.head, R.split( 'T' ) );

// mapListData :: [{data: {list: a}}] -> [a]
const mapListData = R.map( R.path( [ 'data', 'list' ] ) );

// parseCreateActions :: [Action] -> [List]
const parseCreateActions = R.compose(
  groupByWith(
    R.prop( 'date' ),
    ( a, b ) => ({
      date: a,
      content: R.compose( countCardsPerList, mapListData )( b )
    })
  ),
  R.map( R.over( R.lensProp( 'date' ), parseDate ) )
);

export {countCardsPerList, parseDate, mapListData, parseCreateActions};
