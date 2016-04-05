import R from 'ramda';

import * as date from './date';
import * as utility from './utility';
import * as ramda from './ramda';

export default R.mergeAll( [
  utility,
  date,
  ramda
] );
