import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {parseStartDates, parseLeadTime, avgLeadTime} from './times';
import {filterBetweenDates} from '../../utils/date';

function TrelloKanbanMetrics ( { actions$, dates$ } ) {
  const lists$ = Observable.of( [ "Backlog", "Card Preparation [2]", "Production [3]", "Tests QA [2]", "Mise en live [1]", "In Production", "Live (April 2016)" ] );

  const selectedPeriodActions$ = Observable.combineLatest(
    dates$,
    actions$,
    ( { startDate, endDate }, actions ) =>
      filterBetweenDates( startDate, endDate, actions )
  );

  const cards$ = Observable.combineLatest(
    selectedPeriodActions$,
    lists$,
    parseStartDates
  );

  const vtree$ = cards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      avgLeadTime,
      R.tap( console.log.bind( console, "leadTimes" ) ),
      parseLeadTime,
      R.tap( console.log.bind( console, "startDates" ) )
    )
  );

  return {
    DOM: vtree$
  };
}

export default TrelloKanbanMetrics;
