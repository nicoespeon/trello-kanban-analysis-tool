import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {
  parseStartDates,
  parseLeadTime,
  avgLeadTime,
  isMissingInformation
} from './times';
import {filterBetweenDates} from '../../utils/date';

function TrelloKanbanMetrics ( { actions$, dates$, lists$ } ) {
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

  const missingInformationCardIds$ = cards$.map(
    R.compose(
      R.pluck( 'id' ),
      R.filter( isMissingInformation )
    )
  );

  const vtree$ = cards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      avgLeadTime,
      parseLeadTime
    )
  );

  return {
    DOM: vtree$,
    Trello: missingInformationCardIds$
  };
}

export default TrelloKanbanMetrics;
