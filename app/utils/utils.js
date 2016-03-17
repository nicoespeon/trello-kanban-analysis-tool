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
  return R.compose(
    R.map( R.apply( fn ) ),
    R.toPairs,
    R.groupBy( prop )
  )( data );
} );

// parseDate :: String -> String
const parseDate = R.compose( R.head, R.split( 'T' ) );

// sortByDate :: [{date: String}] -> [{date: String}]
const sortByDate = R.sortBy( R.prop( 'date' ) );

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

export {countByWith, groupByWith, parseDate, sortByDate, lensPath, pathOr};
