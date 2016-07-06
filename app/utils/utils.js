import R from 'ramda';

import * as date from './date';
import * as fn from './function';
import * as list from './list';
import * as number from './number';
import * as ramda from './ramda';
import * as relation from './relation';
import * as trello from './trello';

export default R.mergeAll([
  date,
  fn,
  list,
  number,
  ramda,
  relation,
  trello,
]);
