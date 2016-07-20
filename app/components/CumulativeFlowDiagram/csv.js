import R from 'ramda';
import moment from 'moment';

// getHead :: [Graph] -> [[String]]
const getHead = (data) => [
  R.compose(
    R.concat(['']),
    R.flatten,
    R.map(x => moment(x).format('YYYY-MM-DD')),
    R.map(R.head),
    R.propOr([], 'values'),
    R.head
  )(data),
];

// getBody :: [Graph] -> [[String|Number]]
const getBody = R.compose(
  R.map(
    R.converge(
      (key, values) => R.concat([key], values),
      [
        R.prop('key'),
        R.compose(
          R.flatten,
          R.map(R.last),
          R.prop('values')
        ),
      ]
    )
  )
);

// graphToCSV :: [Graph] -> [[String|Number]]
const graphToCSV = R.converge(R.concat, [getHead, getBody]);

export { getHead, getBody, graphToCSV };
