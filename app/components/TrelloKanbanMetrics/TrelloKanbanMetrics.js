import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {parseStartDates, parseLeadTime, avgLeadTime} from './times';

function TrelloKanbanMetrics ( { actions$ } ) {
  const lists$ = Observable.of( [ "Backlog", "Card Preparation [2]", "Production [3]", "Tests QA [2]", "Mise en live [1]", "In Production", "Live (April 2016)" ] );

  const cards$ = Observable.combineLatest(
    actions$,
    lists$,
    parseStartDates
  );

  const vtree$ = cards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      avgLeadTime,
      R.tap(console.log.bind(console, "leadTimes")),
      parseLeadTime,
      R.tap(console.log.bind(console, "startDates"))
    )
  );

  return {
    DOM: vtree$
  };
}

export default TrelloKanbanMetrics;
