import R from 'ramda';

import * as date from './date';
import * as ramda from './ramda';
import * as trello from './trello';
import * as utility from './utility';

export default R.mergeAll([
  date,
  ramda,
  trello,
  utility,
]);
