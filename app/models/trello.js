import R from 'ramda';
import {countByWith, groupByWith, parseDate, sortByDate} from '../utils/utils';

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

// consolidateActions :: [List] -> [List]
const consolidateActions = R.compose(
  R.tail,
  R.scan(
    ( a, b ) => {
      const scanContent = R.compose(
        consolidateContent,
        R.concat( R.prop( 'content', a ) )
      );
      return R.over( R.lensProp( 'content' ), scanContent, b );
    },
    { content: [] }
  ),
  sortByDate
);

// parseActions :: [Action] -> [List]
const parseActions = R.compose(
  consolidateActions,
  parseCreateActions
);

export {
  countCardsPerList,
  sumNumberOfCards,
  mapListData,
  consolidateContent,
  parseCreateActions,
  parseDeleteActions,
  consolidateActions,
  parseActions
};
