import R from 'ramda';

import {allLists} from './lists';
import {getListNameFromId} from '../../utils/trello';

// numberOfCardsAtDate :: String -> String -> [List] -> Number
const numberOfCardsAtDate = ( list, date, data ) => {
  return R.compose(
    R.propOr( 0, 'numberOfCards' ),
    R.find( R.propEq( 'list', list ) ),
    R.propOr( 0, 'content' ),
    R.find( R.propEq( 'date', date ) )
  )( data );
};

// parsedValueAtDate :: String -> [List] -> String -> [Date, Number]
const parsedValueAtDate = R.curry( ( list, data, date ) => [
  new Date( date ).getTime(),
  numberOfCardsAtDate( list, date, data )
] );

// parseToGraph :: [{id: String, name: String}}] -> [List] -> [Graph]
const parseToGraph = R.curry( ( displayedLists, data ) => {
  return R.compose(
    R.map( R.over( R.lensProp( 'key' ), getListNameFromId( displayedLists ) ) ),
    R.filter( ( data ) => R.contains(
      R.prop( 'key', data ),
      R.pluck( 'id', displayedLists )
    ) ),
    R.map( ( list ) => ({
      key: list,
      values: R.map( parsedValueAtDate( list, data ), R.pluck( 'date', data ) )
    }) ),
    allLists,
    R.defaultTo( [] )
  )( data );
} );

export {numberOfCardsAtDate, parseToGraph};
