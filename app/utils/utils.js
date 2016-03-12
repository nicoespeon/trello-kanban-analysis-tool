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

export {countByWith, groupByWith, parseDate, sortByDate};
