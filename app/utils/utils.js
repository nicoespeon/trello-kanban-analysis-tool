import R from 'ramda';

// countByWith :: (a -> String) -> (String,Number -> {B: b, C: c}) -> [a] -> [{B: b, C: c}]
const countByWith = R.curry( ( prop, fn, data ) => {
  return R.compose(
    R.map( R.apply( fn ) ),
    R.toPairs,
    R.countBy( prop )
  )( data );
} );

// groupByWith :: (a -> String) -> (String,[a] -> {B: b, C: c}) -> [a] -> [{B: b, C: c}]
const groupByWith = R.curry( ( prop, fn, data ) => {
  return R.cond( [
    [
      R.is( Array ),
      R.compose(
        R.map( R.apply( fn ) ),
        R.toPairs,
        R.groupBy( prop )
      )
    ],
    [ R.T, R.always( [] ) ]
  ] )( data );
} );

// parseDate :: String -> String
const parseDate = R.compose( R.head, R.split( 'T' ) );

// sortByDateDesc :: [{date: String}] -> [{date: String}]
const sortByDateDesc = R.compose(
  R.unary( R.reverse ),
  R.sortBy( R.prop( 'date' ) )
);

// uniqByDateLast :: [{date: String}] -> [{date: String}]
const uniqByDateLast = R.compose(
  R.unary( R.reverse ),
  R.uniqBy( R.prop( 'date' ) ),
  R.reverse
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

// Pattern for list names with WIP: "Production [3]" -> ["Production", " [3]"]
const parsedNamePattern = /(.*?)(\s\[\d+\])$/;

// parseListName :: String -> [String | Undefined]
const parseListName = R.cond( [
  [
    R.test( parsedNamePattern ),
    R.compose( R.head, R.tail, R.match( parsedNamePattern ) )
  ],
  [ R.T, R.identity ]
] );

// These are Ramda v0.17+ methods.
// I'm stuck with v0.17.1 because of babel-plugin-ramda which does not support
// babel v6.x on its latest version.
// Hence the one I use references Ramda v0.17.1.
// TODO - upgrade babel to v6.x, then use Ramda v0.17+ and drop these.
const lensPath = R.curry( function lensPath ( p ) {
  return R.lens( R.path( p ), R.assocPath( p ) );
} );

const pathOr = R.curry( function pathOr ( d, p, obj ) {
  return R.defaultTo( d, R.path( p, obj ) );
} );

export {
  countByWith,
  groupByWith,
  parseDate,
  sortByDateDesc,
  uniqByDateLast,
  filterBeforeDate,
  filterAfterDate,
  filterBetweenDates,
  parseListName,
  lensPath,
  pathOr
};
