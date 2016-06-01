import { button } from '@cycle/dom';
import { Observable } from 'rx';
import R from 'ramda';

import { parseActions } from './actions';
import { parseToGraph } from './graph';

import { today, tomorrow, filterBetweenDates } from '../../utils/date';

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

  const period$ = Observable.combineLatest(
    previewTomorrow$,
    dates$,
    (previewTomorrow, { startDate, endDate }) => ({
      startDate,
      endDate: previewTomorrow ? tomorrow : endDate,
    })
  );

  const clicks$ = DOM
    .select('.button')
    .events('click')
    .startWith(false);

  const vtree$ = props$.map((props) => button(
    { className: R.join(' ', R.concat(['button'], props.classNames)) },
    props.label)
  );

  const parsedActions$ = Observable.combineLatest(
    period$,
    lists$,
    actions$,
    currentDate$,
    ({ startDate, endDate }, lists, actions, currentDate) => R.compose(
      filterBetweenDates(startDate, endDate),
      parseActions(currentDate, lists)
    )(actions)
  );

  return {
    DOM: vtree$,
    Trello: clicks$,
    Graph: Observable.combineLatest(
      displayedLists$,
      parsedActions$,
      parseToGraph
    ),
  };
}

export default TrelloCFD;
