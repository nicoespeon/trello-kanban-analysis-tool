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
  endOfMonth,
} from './utils/date';
import { getDisplayedLists } from './utils/trello';

function main({ DOM, TrelloFetch, TrelloMissingInfo }) {
  const publishedTrelloLists$ = TrelloFetch.lists$.publish();
  const publishedTrelloActions$ = TrelloFetch.actions$.publish();
  const publishedTrelloCardsActions$$ = TrelloMissingInfo.cardsActions$$.publish();

  const trelloLists$ = publishedTrelloLists$.startWith([]);
  const trelloActions$ = publishedTrelloActions$.startWith([]);

  // Checkbox to preview tomorrow CFD

  const PreviewTomorrow = isolate(LabeledCheckbox);

  const previewTomorrowProps$ = Observable.of({
    name: 'preview-tomorrow',
    label: 'Preview tomorrow CFD (include today operations)',
  });

  const previewTomorrow = PreviewTomorrow({
    DOM,
    props$: previewTomorrowProps$,
  });

  // Select to choose the displayed board

  const BoardSelect = isolate(LabeledSelect);

  const boardProps$ = TrelloFetch.boards$
    .map((boards) => ({
      name: 'board',
      label: 'Board',
      classNames: ['browser-default'],
      select: R.head,
      render: (value) => R.propOr(
        value,
        'name',
        R.find(R.propEq('shortLink', value), boards)
      ),
    }));

  const boardSelect = BoardSelect({
    DOM,
    props$: boardProps$,
    values$: TrelloFetch.boards$.map(R.pluck('shortLink')),
  });

  // Select to choose the first displayed list

  const FirstDisplayedListSelect = isolate(LabeledSelect);

  const firstDisplayedListProps$ = Observable.of({
    name: 'first-displayed-list',
    label: 'Work begins',
    classNames: ['browser-default'],
    select: R.head,
  });

  const firstDisplayedListSelect = FirstDisplayedListSelect({
    DOM,
    props$: firstDisplayedListProps$,
    values$: trelloLists$.map(R.pluck('name')),
  });

  // Select to choose the last displayed list

  const LastDisplayedListSelect = isolate(LabeledSelect);

  const lastDisplayedListProps$ = Observable.of({
    name: 'last-displayed-list',
    label: 'Work ends',
    classNames: ['browser-default'],
    select: R.last,
  });

  const lastDisplayedListSelect = LastDisplayedListSelect({
    DOM,
    props$: lastDisplayedListProps$,
    values$: trelloLists$.map(R.pluck('name')),
  });

  // Button to select last month period

  const SelectLastMonthButton = isolate(SelectDatesButton);

  const selectLastMonthProps$ = Observable.of({
    label: 'Last month',
    classNames: ['btn waves-effect waves-light trello-blue'],
    startDate: lastMonth,
    endDate: endOfLastMonth,
  });

  const selectLastMonthButton = SelectLastMonthButton({
    DOM,
    props$: selectLastMonthProps$,
  });

  // Button to select current month period

  const SelectCurrentMonthButton = isolate(SelectDatesButton);

  const selectCurrentMonthProps$ = Observable.of({
    label: 'Current month',
    classNames: ['btn waves-effect waves-light trello-blue'],
    startDate: currentMonth,
    endDate: endOfMonth,
  });

  const selectCurrentMonthButton = SelectCurrentMonthButton({
    DOM,
    props$: selectCurrentMonthProps$,
  });

  const selectedPeriodDates$ = Observable.merge(
    selectLastMonthButton.dates$,
    selectCurrentMonthButton.dates$
  ).startWith({ startDate: currentMonth, endDate: endOfMonth });

  // Datepicker to select start date

  const StartDatePicker = isolate(LabeledDatePicker);

  const startDatePickerProps$ = Observable.of({
    name: 'start-date',
    label: 'Start Date',
  });

  const startDatePicker = StartDatePicker({
    DOM,
    props$: startDatePickerProps$,
    value$: selectedPeriodDates$.map(R.prop('startDate')),
  });

  // Datepicker to select end date

  const EndDatePicker = isolate(LabeledDatePicker);

  const endDatePickerProps$ = Observable.of({
    name: 'end-date',
    label: 'End Date',
  });

  const endDatePicker = EndDatePicker({
    DOM,
    props$: endDatePickerProps$,
    value$: selectedPeriodDates$.map(R.prop('endDate')),
  });

  // Trello CFD

  const trelloCFDProps$ = Observable.of({
    label: 'Get actions',
    classNames: ['btn waves-effect waves-light trello-green'],
  });

  const parseTrelloCFDDate = R.cond([
    [R.isEmpty, R.always(null)],
    [R.T, R.identity],
  ]);

  const trelloCFDDates$ = Observable.combineLatest(
    startDatePicker.selected$.map(parseTrelloCFDDate),
    endDatePicker.selected$.map(parseTrelloCFDDate),
    (startSelected, endSelected) => ({
      startDate: startSelected,
      endDate: endSelected,
    })
  );

  const trelloDisplayedLists$ = Observable.combineLatest(
    trelloLists$,
    firstDisplayedListSelect.selected$,
    lastDisplayedListSelect.selected$,
    getDisplayedLists
  );

  const trelloCFD = TrelloCFD({
    DOM,
    actions$: trelloActions$,
    lists$: trelloLists$,
    displayedLists$: trelloDisplayedLists$,
    dates$: trelloCFDDates$,
    props$: trelloCFDProps$,
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
    DOM: Observable.combineLatest(
      boardSelect.DOM,
      trelloCFD.DOM,
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      startDatePicker.DOM,
      endDatePicker.DOM,
      previewTomorrow.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      trelloKanbanMetrics.DOM,
      (
        boardVTree,
        trelloCFDVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        startDatePickerVTree,
        endDatePickerVTree,
        previewTomorrowVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree,
        trelloKanbanMetricsVTree
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
          div('.center-align-around', [
            trelloCFDVTree,
            selectLastMonthButtonVTree,
            selectCurrentMonthButtonVTree,
          ]),
          div('.m-top.row', [
            div('.col.s6', [startDatePickerVTree]),
            div('.col.s6', [endDatePickerVTree]),
          ]),
          div('.m-top', [trelloKanbanMetricsVTree]),
          div('.m-top.row', [
            div('.col.s12', [previewTomorrowVTree]),
          ]),
        ]),
      ])
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
  DOM: makeDOMDriver('#app'),
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
