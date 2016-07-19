import { div, button } from '@cycle/dom';
import isolate from '@cycle/isolate';
import { Observable } from 'rx';
import R from 'ramda';

import LabeledSelect from '../LabeledSelect/LabeledSelect';
import LabeledCheckbox from '../LabeledCheckbox/LabeledCheckbox';
import SelectDatesButton from '../SelectDatesButton/SelectDatesButton';
import LabeledDatePicker from '../LabeledDatePicker/LabeledDatePicker';

import { lastMonth, endOfLastMonth, currentMonth, today, tomorrow } from '../../utils/date';

function Controls({ DOM, boards$, lists$, Storage }) {
  // Selects to choose displayed board and lists

  const boardSelectProps$ = Observable.combineLatest(
      boards$,
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
    DOM,
    props$: boardSelectProps$,
    values$: boards$.map(R.pluck('shortLink')),
  });

  const firstDisplayedListSelect = isolate(LabeledSelect)({
    DOM,
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
    values$: lists$.map(R.pluck('name')),
  });

  const lastDisplayedListSelect = isolate(LabeledSelect)({
    DOM,
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
    values$: lists$.map(R.pluck('name')),
  });

  // Buttons to select period

  const selectLastMonthButton = isolate(SelectDatesButton)({
    DOM,
    props$: Observable.of({
      label: 'Last month',
      classNames: ['btn waves-effect waves-light trello-blue'],
      startDate: lastMonth,
      endDate: endOfLastMonth,
    }),
  });

  const selectCurrentMonthButton = isolate(SelectDatesButton)({
    DOM,
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
    DOM,
    props$: Observable.of({
      name: 'start-date',
      label: 'Start Date',
      max: today,
    }),
    value$: selectPeriod$.map(R.prop('startDate')),
  });

  const endDatePicker = isolate(LabeledDatePicker)({
    DOM,
    props$: Observable.of({
      name: 'end-date',
      label: 'End Date',
      max: today,
    }),
    value$: selectPeriod$.map(R.prop('endDate')),
  });

  // Checkbox to preview tomorrow CFD

  const previewTomorrow = isolate(LabeledCheckbox)({
    DOM,
    props$: Observable.of({
      name: 'preview-tomorrow',
      label: 'Preview tomorrow CFD (include today operations)',
    }),
  });

  // Refresh data

  const refreshClicks$ = DOM
    .select('.refresh-button')
    .events('click')
    .startWith(false);

  // Compute selected dates from controls values.

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

  return {
    selectedBoard$: boardSelect.selected$,
    selectedFirstList$: firstDisplayedListSelect.selected$,
    selectedLastList$: lastDisplayedListSelect.selected$,
    previewTomorrow$: previewTomorrow.checked$,
    selectedDates$,
    refreshClicks$,
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
    DOM: Observable.combineLatest(
      boardSelect.DOM,
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      startDatePicker.DOM,
      endDatePicker.DOM,
      previewTomorrow.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      (
        boardVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        startDatePickerVTree,
        endDatePickerVTree,
        previewTomorrowVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ) =>
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
            button(
              '.refresh-button.btn.waves-effect.waves-light.trello-green',
              'Refresh data'
            ),
            selectLastMonthButtonVTree,
            selectCurrentMonthButtonVTree,
          ]),
          div('.m-top.row', [
            div('.col.s12', [previewTomorrowVTree]),
          ]),
        ])
    ),
  };
}

export default Controls;
