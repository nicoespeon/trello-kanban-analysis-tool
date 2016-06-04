import { button } from '@cycle/dom';
import { Observable } from 'rx';
import R from 'ramda';

import { parseActions } from './actions';
import { parseToGraph } from './graph';
import { graphToCSV } from './csv';

import { today, tomorrow, filterBetweenDates, nextDay } from '../../utils/date';

function TrelloCFD(
  {
    DOM,
    actions$,
    lists$,
    displayedLists$,
    dates$,
    props$,
    previewTomorrow$,
  }
) {
  const currentDate$ = previewTomorrow$.map(R.cond([
    [R.equals(true), R.always(tomorrow)],
    [R.equals(false), R.always(today)],
  ]));

  const clicks$ = DOM
    .select('.button')
    .events('click')
    .startWith(false);

  const vtree$ = props$.map((props) => button(
    { className: R.join(' ', R.concat(['button'], props.classNames)) },
    props.label)
  );

  const parsedActions$ = Observable.combineLatest(
    dates$,
    lists$,
    actions$,
    currentDate$,
    ({ startDate, endDate }, lists, actions, currentDate) => R.compose(
      filterBetweenDates(startDate, nextDay(endDate)),
      parseActions(currentDate, lists)
    )(actions)
  );

  const graph$ = Observable.combineLatest(
    displayedLists$,
    parsedActions$,
    parseToGraph
  );

  return {
    DOM: vtree$,
    Trello: clicks$,
    Graph: graph$,
    CSV: graph$.map(graphToCSV),
  };
}

export default TrelloCFD;
