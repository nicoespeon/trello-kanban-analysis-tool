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

export {
  countByWith,
  groupByWith,
  parseListName
};
