import R from 'ramda';

// numberOfCardsAtDate :: String -> String -> [List] -> Number
const numberOfCardsAtDate = ( list, date, data ) => {
  return R.compose(
    R.propOr( 0, 'numberOfCards' ),
    R.find( R.propEq( 'list', list ) ),
    R.propOr( 0, 'content' ),
    R.find( R.propEq( 'date', date ) )
  )( data );
};

const parseTrelloData = R.identity;

export {numberOfCardsAtDate, parseTrelloData};
