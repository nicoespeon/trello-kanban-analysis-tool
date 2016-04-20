import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {
  parseStartDates,
  filterCardsOnPeriod,
  parseAvgLeadTime,
  isMissingInformation
} from './times';

function TrelloKanbanMetrics ( { actions$, dates$, lists$, complementaryActions$ } ) {

  // Determine missing information

  const cards$ = Observable.combineLatest(
    actions$,
    lists$,
    dates$,
    ( actions, lists, dates ) =>
      filterCardsOnPeriod( dates, parseStartDates( actions, lists ) )
  );

  const complementaryCardsIds$ = complementaryActions$.map(
    R.compose(
      R.uniq,
      R.map( R.path( [ 'data', 'card', 'id' ] ) ),
      R.flatten
    )
  );

  const missingInformationCardIds$ = Observable.combineLatest(
    cards$,
    complementaryCardsIds$,
    ( cards, complementaryCardsIds ) => R.compose(
      R.pluck( 'id' ),
      R.filter( isMissingInformation ),
      // Only pick cards which are not already in complementary ones.
      R.differenceWith(
        R.useWith( R.equals, [ R.prop( 'id' ), R.identity ] ),
        R.__,
        complementaryCardsIds
      )
    )( cards )
  );

  // Calculate Lead Time from consolidated data

  const consolidatedActions$ = Observable.combineLatest(
    actions$,
    complementaryActions$,
    R.useWith( R.concat, [ R.identity, R.flatten ] )
  );

  const consolidatedCards$ = Observable.combineLatest(
    consolidatedActions$,
    lists$,
    dates$,
    ( actions, lists, dates ) =>
      filterCardsOnPeriod( dates, parseStartDates( actions, lists ) )
  );

  const vtree$ = consolidatedCards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      parseAvgLeadTime
    )
  );

  return {
    DOM: vtree$,
    Trello: missingInformationCardIds$
  };
}

export default TrelloKanbanMetrics;
