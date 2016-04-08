import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {avgLeadTime} from './times';

function LabeledSelect () {
  const cards$ = Observable.of( [
    { leadTime: 3 },
    { leadTime: 0 },
    { leadTime: 8 },
    { leadTime: 1 },
    { leadTime: 13 },
    { leadTime: 7 },
    { leadTime: 2 }
  ] );

  const vtree$ = cards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      avgLeadTime
    )
  );

  return {
    DOM: vtree$
  };
}

export default LabeledSelect;
