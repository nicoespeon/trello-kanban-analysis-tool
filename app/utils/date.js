import R from 'ramda';
import moment from 'moment';

// Dates

const _dateFormat = 'YYYY-MM-DD';

const lastMonth = moment()
  .month( moment().month() - 1 )
  .date( 1 )
  .format( _dateFormat );

const endOfLastMonth = moment( lastMonth )
  .date( moment( lastMonth, _dateFormat ).daysInMonth() )
  .format( _dateFormat );

const currentMonth = moment().date( 1 ).format( _dateFormat );

const today = moment().format( _dateFormat );

// parseDate :: String -> String
const parseDate = R.compose( R.head, R.split( 'T' ) );

// sortByDate :: [{date: String}] -> [{date: String}]
const sortByDate = R.sortBy( R.prop( 'date' ) );

// sortByDateDesc :: [{date: String}] -> [{date: String}]
const sortByDateDesc = R.compose(
  R.unary( R.reverse ),
  sortByDate
);

// uniqByDateDesc :: [{date: String}] -> [{date: String}]
const uniqByDateDesc = R.compose(
  R.uniqBy( R.prop( 'date' ) ),
  R.reverse
);

// nextDay :: String -> String
const nextDay = ( date ) => moment( date ).add( 1, 'days' ).format( _dateFormat );

// _withNextDay :: [{date: String}] -> [{date: String}]
const _withNextDay = R.over( R.lensProp( 'date' ), nextDay );

// _wasPreviousDateOf :: [{date: String}] -> [{date: String}] -> Boolean
const _wasPreviousDateOf = R.curry( ( a, b ) => {
  return R.propEq( 'date', nextDay( R.prop( 'date', b ) ), a );
} );

// _scanMissingDate :: [{date: String|undefined}|[{date: String}]] -> [{date: String}] -> [{date: String}|[{date: String}]]
function _scanMissingDate ( a, b ) {
  return R.compose(
    R.cond( [
      [
        R.either( R.isEmpty, _wasPreviousDateOf( b ) ),
        R.always( b )
      ],
      [
        R.T,
        ( a ) => [
          _withNextDay( a ),
          _scanMissingDate( _withNextDay( a ), b )
        ]
      ]
    ] ),
    R.last,
    R.flatten,
    R.concat( [] )
  )( a );
}

// fillMissingDates :: [{date: String}] -> [{date: String}]
const fillMissingDates = R.compose(
  R.tail,
  R.flatten,
  R.scan( _scanMissingDate, {} ),
  sortByDate
);

// _filterByDate :: (String -> String -> Boolean) -> String -> [{date: String}] -> [{date: String}]
const _filterByDate = R.curry( ( fn, date, items ) => R.filter(
  R.propSatisfies(
    x => R.or( R.isNil( date ), fn( x, date ) ),
    'date'
  ),
  items
) );

// filterBeforeDate :: String -> [{date: String}] -> [{date: String}]
const filterBeforeDate = _filterByDate( R.lt );

// filterAfterDate :: String -> [{date: String}] -> [{date: String}]
const filterAfterDate = _filterByDate( R.gte );

// filterBetweenDates :: String -> String -> [{date: String}] -> [{date: String}]
const filterBetweenDates = R.curry( ( startDate, endDate, items ) => R.compose(
  filterBeforeDate( endDate ),
  filterAfterDate( startDate )
)( items ) );

// daysSpent :: Date -> Date -> Integer
const daysSpent = ( start, end ) => moment( end ).diff( moment( start ), 'days' );

export {
  lastMonth,
  currentMonth,
  endOfLastMonth,
  today,

  parseDate,
  sortByDate,
  sortByDateDesc,
  uniqByDateDesc,
  nextDay,
  fillMissingDates,
  filterBeforeDate,
  filterAfterDate,
  filterBetweenDates,
  daysSpent
};
