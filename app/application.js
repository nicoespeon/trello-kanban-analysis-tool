import Cycle from '@cycle/core';
import { makeDOMDriver, div, h1, small } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { Observable } from 'rx';
import R from 'ramda';

import { trelloSinkDriver } from './drivers/Trello';
import { makeGraphDriver } from './drivers/Graph';

import LabeledSelect from './components/LabeledSelect/LabeledSelect';
import LabeledCheckbox from './components/LabeledCheckbox/LabeledCheckbox';
import LabeledDatePicker from './components/LabeledDatePicker/LabeledDatePicker';
import SelectDatesButton from './components/SelectDatesButton/SelectDatesButton';
import TrelloCFD from './components/TrelloCFD/TrelloCFD';
import TrelloKanbanMetrics from './components/TrelloKanbanMetrics/TrelloKanbanMetrics';

import {
  lastMonth,
  endOfLastMonth,
  currentMonth,
  today,
  tomorrow,
} from './utils/date';
import { getDisplayedLists } from './utils/trello';

function main({ DOMAboveChart, DOMBelowChart, TrelloFetch, TrelloMissingInfo }) {
  const publishedTrelloLists$ = TrelloFetch.lists$.publish();
  const publishedTrelloActions$ = TrelloFetch.actions$.publish();
  const publishedTrelloCardsActions$$ = TrelloMissingInfo.cardsActions$$.publish();

  const trelloLists$ = publishedTrelloLists$.startWith([]);
  const trelloActions$ = publishedTrelloActions$.startWith([]);

  // Checkbox to preview tomorrow CFD

  const previewTomorrow = isolate(LabeledCheckbox)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'preview-tomorrow',
      label: 'Preview tomorrow CFD (include today operations)',
    }),
  });

  // Selects to choose displayed board and lists

  const parseBoardProps = (boards) => ({
    name: 'board',
    label: 'Board',
    classNames: ['browser-default'],
    select: R.head,
    render: (value) => R.propOr(
      value,
      'name',
      R.find(R.propEq('shortLink', value), boards)
    ),
  });

  const boardSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: TrelloFetch.boards$.map(parseBoardProps),
    values$: TrelloFetch.boards$.map(R.pluck('shortLink')),
  });

  const firstDisplayedListSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'first-displayed-list',
      label: 'Work begins',
      classNames: ['browser-default'],
      select: R.head,
    }),
    values$: trelloLists$.map(R.pluck('name')),
  });

  const lastDisplayedListSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'last-displayed-list',
      label: 'Work ends',
      classNames: ['browser-default'],
      select: R.last,
    }),
    values$: trelloLists$.map(R.pluck('name')),
  });

  // Buttons to select period

  const selectLastMonthButton = isolate(SelectDatesButton)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      label: 'Last month',
      classNames: ['btn waves-effect waves-light trello-blue'],
      startDate: lastMonth,
      endDate: endOfLastMonth,
    }),
  });

  const selectCurrentMonthButton = isolate(SelectDatesButton)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      label: 'Current month',
      classNames: ['btn waves-effect waves-light trello-blue'],
      startDate: currentMonth,
      endDate: today,
    }),
  });

  const selectedPeriodDates$ = Observable.merge(
    selectLastMonthButton.dates$,
    selectCurrentMonthButton.dates$
  ).startWith({ startDate: currentMonth, endDate: today });

  // Datepickers to select dates

  const startDatePicker = isolate(LabeledDatePicker)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'start-date',
      label: 'Start Date',
      max: today,
    }),
    value$: selectedPeriodDates$.map(R.prop('startDate')),
  });

  const endDatePicker = isolate(LabeledDatePicker)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'end-date',
      label: 'End Date',
      max: today,
    }),
    value$: selectedPeriodDates$.map(R.prop('endDate')),
  });

  // Trello CFD

  const parseTrelloCFDDate = R.cond([
    [R.isEmpty, R.always(null)],
    [R.T, R.identity],
  ]);

  const trelloCFDDates$ = Observable.combineLatest(
    startDatePicker.selected$.map(parseTrelloCFDDate),
    endDatePicker.selected$.map(parseTrelloCFDDate),
    previewTomorrow.checked$,
    (startSelected, endSelected, previewTomorrowChecked) => ({
      startDate: startSelected,
      endDate: previewTomorrowChecked ? tomorrow : endSelected,
    })
  );

  const trelloDisplayedLists$ = Observable.combineLatest(
    trelloLists$,
    firstDisplayedListSelect.selected$,
    lastDisplayedListSelect.selected$,
    getDisplayedLists
  );

  const trelloCFD = TrelloCFD({
    DOM: DOMBelowChart,
    actions$: trelloActions$,
    lists$: trelloLists$,
    displayedLists$: trelloDisplayedLists$,
    dates$: trelloCFDDates$,
    props$: Observable.of({
      label: 'Get actions',
      classNames: ['btn waves-effect waves-light trello-green'],
    }),
    previewTomorrow$: previewTomorrow.checked$,
  });

  // Trello Kanban metrics

  const trelloKanbanMetrics = TrelloKanbanMetrics({
    actions$: trelloActions$,
    dates$: trelloCFDDates$,
    lists$: trelloDisplayedLists$,
    complementaryActions$: publishedTrelloCardsActions$$
      .switch()
      .startWith([])
      .scan(R.concat),
  });

  // Connect
  publishedTrelloLists$.connect();
  publishedTrelloActions$.connect();
  publishedTrelloCardsActions$$.connect();

  return {
    DOMAboveChart: Observable.combineLatest(
      boardSelect.DOM,
      trelloCFD.DOM,
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      startDatePicker.DOM,
      endDatePicker.DOM,
      previewTomorrow.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      (
        boardVTree,
        trelloCFDVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        startDatePickerVTree,
        endDatePickerVTree,
        previewTomorrowVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ) => div([
        h1('.title.center-align.trello-blue.white-text', [
          'TKAT ',
          small('.trello-blue-100-text', '(Trello Kanban Analysis Tool)'),
        ]),
        div('.container', [
          div('.m-top.row', [
            div('.col.s6', [boardVTree]),
            div('.col.s3', [firstDisplayedListVTree]),
            div('.col.s3', [lastDisplayedListVTree]),
          ]),
          div('.m-top.row', [
            div('.col.s6', [startDatePickerVTree]),
            div('.col.s6', [endDatePickerVTree]),
          ]),
          div('.center-align-around', [
            trelloCFDVTree,
            selectLastMonthButtonVTree,
            selectCurrentMonthButtonVTree,
          ]),
          div('.m-top.row', [
            div('.col.s12', [previewTomorrowVTree]),
          ]),
        ]),
      ])
    ),
    DOMBelowChart: trelloKanbanMetrics.DOM.map(
      (trelloKanbanMetricsVTree) =>
        div('.container.m-top', [trelloKanbanMetricsVTree])
    ),
    TrelloFetch: Observable.combineLatest(
      boardSelect.selected$,
      trelloCFD.Trello,
      R.compose(R.head, R.unapply(R.identity))
    ),
    TrelloMissingInfo: trelloKanbanMetrics.Trello,
    Graph: trelloCFD.Graph,
  };
}

const drivers = {
  DOMAboveChart: makeDOMDriver('#above-chart'),
  DOMBelowChart: makeDOMDriver('#below-chart'),
  TrelloFetch: trelloSinkDriver,
  TrelloMissingInfo: trelloSinkDriver,
  Graph: makeGraphDriver('#chart svg'),
};

Trello.authorize({
  type: 'popup',
  name: 'Trello Kanban Analysis Tool',
  scope: { read: true },
  persist: true,
  expiration: 'never',
  success: () => {
    Cycle.run(main, drivers);
  },
  error: () => console.log("Can't connect to Trello"),
});
