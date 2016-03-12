import R from 'ramda';
import {countByWith, groupByWith, parseDate, sortByDate} from '../utils/utils';

// countCardsPerList :: [List] -> [List]
const countCardsPerList = countByWith(
  R.prop( 'name' ),
  ( a, b ) => ({ list: a, numberOfCards: b })
);

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

export {countCardsPerList, sumNumberOfCards, mapListData, consolidateContent, parseCreateActions, consolidateActions};
