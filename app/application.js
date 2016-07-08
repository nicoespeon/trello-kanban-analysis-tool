import Cycle from '@cycle/core';
import { makeDOMDriver, div, h1, small, button } from '@cycle/dom';
import isolate from '@cycle/isolate';
import storageDriver from '@cycle/storage';
import { Observable } from 'rx';
import R from 'ramda';

import { trelloSinkDriver } from './drivers/Trello';
import { makeGraphDriver } from './drivers/Graph';
import { exportToCSVDriver } from './drivers/ExportToCSV';

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
import { argsToArray } from './utils/function';

function main({ DOMAboveChart, DOMBelowChart, TrelloFetch, TrelloMissingInfo, Storage }) {
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

  const boardSelectProps$ = Observable.combineLatest(
    TrelloFetch.boards$,
    Storage.local.getItem('selectedBoard').first(),
    (boards, storedBoard) => ({
      name: 'board',
      label: 'Board',
      classNames: ['browser-default'],
      select: (values) => R.defaultTo(R.head(values), storedBoard),

      // Render board names instead of shortLink when possible.
      render: (shortLink) => R.propOr(
        shortLink,
        'name',
        R.find(R.propEq('shortLink', shortLink), boards)
      ),
    })
  );

  const boardSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: boardSelectProps$,
    values$: TrelloFetch.boards$.map(R.pluck('shortLink')),
  });

  const firstDisplayedListSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: Storage.local.getItem('firstDisplayedList').first()
      .map((storedList) => ({
        name: 'first-displayed-list',
        label: 'Work begins',
        classNames: ['browser-default'],
        select: R.cond([
          [R.contains(storedList), R.always(storedList)],
          [R.T, R.head],
        ]),
      })),
    values$: trelloLists$.map(R.pluck('name')),
  });

  const lastDisplayedListSelect = isolate(LabeledSelect)({
    DOM: DOMAboveChart,
    props$: Storage.local.getItem('lastDisplayedList').first()
      .map((storedList) => ({
        name: 'last-displayed-list',
        label: 'Work ends',
        classNames: ['browser-default'],
        select: R.cond([
          [R.contains(storedList), R.always(storedList)],
          [R.T, R.last],
        ]),
      })),
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

  const selectPeriod$ = Observable.concat(
    Observable.combineLatest(
      Storage.local.getItem('selectedStartDate').first()
        .map(R.defaultTo(currentMonth)),
      Storage.local.getItem('selectedEndDate').first()
        .map(R.defaultTo(today)),
      (startDate, endDate) => ({ startDate, endDate })
    ),
    Observable.merge(
      selectLastMonthButton.dates$,
      selectCurrentMonthButton.dates$
    )
  );

  // Datepickers to select dates

  const startDatePicker = isolate(LabeledDatePicker)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'start-date',
      label: 'Start Date',
      max: today,
    }),
    value$: selectPeriod$.map(R.prop('startDate')),
  });

  const endDatePicker = isolate(LabeledDatePicker)({
    DOM: DOMAboveChart,
    props$: Observable.of({
      name: 'end-date',
      label: 'End Date',
      max: today,
    }),
    value$: selectPeriod$.map(R.prop('endDate')),
  });

  // Trello CFD

  const parseSelectedDate = R.cond([
    [R.isEmpty, R.always(null)],
    [R.T, R.identity],
  ]);

  const selectedDates$ = Observable.combineLatest(
    startDatePicker.selected$.map(parseSelectedDate),
    endDatePicker.selected$.map(parseSelectedDate),
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
    dates$: selectedDates$,
    props$: Observable.of({
      label: 'Refresh data',
      classNames: ['btn waves-effect waves-light trello-green'],
    }),
    previewTomorrow$: previewTomorrow.checked$,
  });

  // Trello Kanban metrics

  const trelloKanbanMetrics = TrelloKanbanMetrics({
    actions$: trelloActions$,
    dates$: selectedDates$,
    lists$: trelloDisplayedLists$,
    complementaryActions$: publishedTrelloCardsActions$$
      .switch()
      .startWith([])
      .scan(R.concat),
  });

  // Download button clicks

  const downloadClicks$ = DOMBelowChart.select('.download-btn').events('click');

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
        div('.container', [
          div('.center-align', [
            button(
              '.download-btn.btn.waves-effect.waves-light.trello-blue',
              'Download .csv'
            ),
          ]),
          div('.m-top.m-bottom', [trelloKanbanMetricsVTree]),
        ])
    ),
    TrelloFetch: Observable.combineLatest(
      boardSelect.selected$,
      trelloCFD.Trello,
      R.compose(R.head, argsToArray)
    ),
    TrelloMissingInfo: trelloKanbanMetrics.Trello,
    Graph: trelloCFD.Graph,
    ExportToCSV: downloadClicks$.withLatestFrom(
      trelloCFD.CSV,
      R.compose(R.last, argsToArray)
    ),
    Storage: Observable.merge(
      boardSelect.selected$
        .map(selected => ({ key: 'selectedBoard', value: selected })),
      firstDisplayedListSelect.selected$
        .map(selected => ({ key: 'firstDisplayedList', value: selected })),
      lastDisplayedListSelect.selected$
        .map(selected => ({ key: 'lastDisplayedList', value: selected })),
      selectedDates$
        .map(period => ({ key: 'selectedStartDate', value: period.startDate })),
      selectedDates$
        .map(period => ({ key: 'selectedEndDate', value: period.endDate }))
    ),
  };
}

const drivers = {
  DOMAboveChart: makeDOMDriver('#above-chart'),
  DOMBelowChart: makeDOMDriver('#below-chart'),
  TrelloFetch: trelloSinkDriver,
  TrelloMissingInfo: trelloSinkDriver,
  Graph: makeGraphDriver('#chart svg'),
  Storage: storageDriver,
  ExportToCSV: exportToCSVDriver,
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
