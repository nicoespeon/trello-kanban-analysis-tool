import R from 'ramda';

import * as date from './utils.date';
import * as utility from './utils.utility';
import * as ramda from './utils.ramda';

export default R.mergeAll( [
  utility,
  date,
  ramda
] );
