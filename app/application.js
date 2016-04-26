import Cycle from '@cycle/core';
import {makeDOMDriver, div, h1, small, input, label} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/Trello';
import {makeGraphDriver} from './drivers/Graph';
import logDriver from './drivers/Log';

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
  endOfMonth
} from './utils/date';
import {getDisplayedLists} from './utils/trello';

function main ( { DOM, TrelloFetch, TrelloMissingInfo } ) {
  const publishedTrelloLists$ = TrelloFetch.lists$.publish();
  const publishedTrelloActions$ = TrelloFetch.actions$.publish();
  const publishedTrelloCardsActions$$ = TrelloMissingInfo.cardsActions$$.publish();

  const trelloLists$ = publishedTrelloLists$.startWith( [] );
  const trelloActions$ = publishedTrelloActions$.startWith( [] );

  // Checkbox to preview tomorrow CFD

  const PreviewTomorrow = isolate( LabeledCheckbox );

  const previewTomorrowProps$ = Observable.of( {
    name: 'preview-tomorrow',
    label: 'Preview tomorrow CFD (include today operations)'
  } );

  const previewTomorrow = PreviewTomorrow( {
    DOM,
    props$: previewTomorrowProps$
  } );

  // Select to choose the displayed board

  const BoardSelect = isolate( LabeledSelect );

  const boardProps$ = TrelloFetch.boards$
    .map( ( boards ) => ({
      name: 'board',
      label: 'Board',
      classNames: [ 'browser-default' ],
      select: R.always( 'LydFpONf' ),
      render: ( value ) => R.propOr(
        value,
        'name',
        R.find( R.propEq( 'shortLink', value ), boards )
      )
    }) );

  const boardSelect = BoardSelect( {
    DOM,
    props$: boardProps$,
    values$: TrelloFetch.boards$.map( R.pluck( 'shortLink' ) )
  } );

  // Select to choose the first displayed list

  const FirstDisplayedListSelect = isolate( LabeledSelect );

  const firstDisplayedListProps$ = Observable.of( {
    name: 'first-displayed-list',
    label: 'Work begins',
    classNames: [ 'browser-default' ],
    select: R.always( 'Backlog' )
  } );

  const firstDisplayedListSelect = FirstDisplayedListSelect( {
    DOM,
    props$: firstDisplayedListProps$,
    values$: trelloLists$.map( R.pluck( 'name' ) )
  } );

  // Select to choose the last displayed list

  const LastDisplayedListSelect = isolate( LabeledSelect );

  const lastDisplayedListProps$ = Observable.of( {
    name: 'last-displayed-list',
    label: 'Work ends',
    classNames: [ 'browser-default' ],
    select: R.last
  } );

  const lastDisplayedListSelect = LastDisplayedListSelect( {
    DOM,
    props$: lastDisplayedListProps$,
    values$: trelloLists$.map( R.pluck( 'name' ) )
  } );

  // Button to select last month period

  const SelectLastMonthButton = isolate( SelectDatesButton );

  const selectLastMonthProps$ = Observable.of( {
    label: 'Last month',
    classNames: [ 'btn waves-effect waves-light' ],
    startDate: lastMonth,
    endDate: endOfLastMonth
  } );

  const selectLastMonthButton = SelectLastMonthButton( {
    DOM,
    props$: selectLastMonthProps$
  } );

  // Button to select current month period

  const SelectCurrentMonthButton = isolate( SelectDatesButton );

  const selectCurrentMonthProps$ = Observable.of( {
    label: 'Current month',
    classNames: [ 'btn waves-effect waves-light' ],
    startDate: currentMonth,
    endDate: endOfMonth
  } );

  const selectCurrentMonthButton = SelectCurrentMonthButton( {
    DOM,
    props$: selectCurrentMonthProps$
  } );

  const selectedPeriodDates$ = Observable.merge(
    selectLastMonthButton.dates$,
    selectCurrentMonthButton.dates$
  ).startWith( { startDate: currentMonth, endDate: endOfMonth } );

  // Datepicker to select start date

  const StartDatePicker = isolate( LabeledDatePicker );

  const startDatePickerProps$ = Observable.of( {
    name: 'start-date',
    label: 'Start Date'
  } );

  const startDatePicker = StartDatePicker( {
    DOM,
    props$: startDatePickerProps$,
    value$: selectedPeriodDates$.map( R.prop( 'startDate' ) )
  } );

  // Datepicker to select end date

  const EndDatePicker = isolate( LabeledDatePicker );

  const endDatePickerProps$ = Observable.of( {
    name: 'end-date',
    label: 'End Date'
  } );

  const endDatePicker = EndDatePicker( {
    DOM,
    props$: endDatePickerProps$,
    value$: selectedPeriodDates$.map( R.prop( 'endDate' ) )
  } );

  // Trello CFD

  const trelloCFDProps$ = Observable.of( {
    label: 'Get actions',
    classNames: [ 'btn waves-effect waves-light purple' ]
  } );

  const trelloCFDDates$ = Observable.combineLatest(
    startDatePicker.selected$,
    endDatePicker.selected$,
    ( startSelected, endSelected ) => ({
      startDate: startSelected,
      endDate: endSelected
    })
  );

  const trelloDisplayedLists$ = Observable.combineLatest(
    trelloLists$,
    firstDisplayedListSelect.selected$,
    lastDisplayedListSelect.selected$,
    getDisplayedLists
  );

  const trelloCFD = TrelloCFD( {
    DOM,
    actions$: trelloActions$,
    lists$: trelloLists$,
    displayedLists$: trelloDisplayedLists$,
    dates$: trelloCFDDates$,
    props$: trelloCFDProps$,
    previewTomorrow$: previewTomorrow.checked$
  } );

  // Trello Kanban metrics

  const trelloKanbanMetrics = TrelloKanbanMetrics( {
    actions$: trelloActions$,
    dates$: trelloCFDDates$,
    lists$: trelloDisplayedLists$,
    complementaryActions$: publishedTrelloCardsActions$$
      .switch()
      .startWith( [] )
      .scan( R.concat )
  } );

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
      ) => div( '.container', [
        h1( '.title.center-align', [
          'TKAT ',
          small( 'Trello Kanban Analysis Tool' )
        ] ),
        div( '.center-align-around', [
          trelloCFDVTree,
          selectLastMonthButtonVTree,
          selectCurrentMonthButtonVTree
        ] ),
        div( '.m-top.row', [
          div( '.col.s6', [ startDatePickerVTree ] ),
          div( '.col.s6', [ endDatePickerVTree ] )
        ] ),
        div( '.m-top.row', [
          div( '.col.s12', [ boardVTree ] ),
          div( '.col.s6', [ firstDisplayedListVTree ] ),
          div( '.col.s6', [ lastDisplayedListVTree ] )
        ] ),
        div( '.m-top', [ trelloKanbanMetricsVTree ] ),
        div( '.m-top.row', [
          div( '.col.s12', [ previewTomorrowVTree ] )
        ] )
      ] )
    ),
    TrelloFetch: Observable.combineLatest(
      boardSelect.selected$,
      trelloCFD.Trello,
      R.compose( R.head, R.unapply( R.identity ) )
    ),
    TrelloMissingInfo: trelloKanbanMetrics.Trello,
    Graph: trelloCFD.Graph,
    Log: trelloCFDDates$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  TrelloFetch: makeTrelloDriver(),
  TrelloMissingInfo: makeTrelloDriver(),
  Graph: makeGraphDriver( '#chart svg' ),
  Log: logDriver
};

Cycle.run( main, drivers );
