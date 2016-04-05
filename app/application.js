import Cycle from '@cycle/core';
import {makeDOMDriver, div, button} from '@cycle/dom';
import isolate from '@cycle/isolate';
import moment from 'moment';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import LabeledSelect from './LabeledSelect/LabeledSelect';
import SelectDatesButton from './SelectDatesButton/SelectDatesButton';

import {parseActions, getDisplayedLists} from './models/trello';
import {parseTrelloData} from './models/graph';

import {filterBetweenDates} from './utils/utils';

function main ( { DOM, Trello } ) {
  const dateFormat = 'YYYY-MM-DD';
  const lastMonth = moment()
    .month( moment().month() - 1 )
    .date( 1 )
    .format( dateFormat );
  const endOfLastMonth = moment( lastMonth )
    .date( moment( lastMonth, dateFormat ).daysInMonth() )
    .format( dateFormat );
  const currentMonth = moment().date( 1 ).format( dateFormat );
  const today = moment().format( dateFormat );

  const trelloLists$ = Trello.lists$.startWith( [] );
  const lists$ = trelloLists$.map( R.map( R.propOr( "", "name" ) ) );

  const trelloActions$ = Trello.actions$.startWith( [] );

  // Select to choose the first displayed list

  const FirstDisplayedListSelect = isolate( LabeledSelect );

  const firstDisplayedListProps$ = Observable.of( {
    name: 'first-displayed-list',
    labelText: 'Work begins',
    select: R.always( 'Backlog' )
  } );

  const firstDisplayedListSelect = FirstDisplayedListSelect( {
    DOM,
    props$: firstDisplayedListProps$,
    values$: lists$
  } );

  // Select to choose the last displayed list

  const LastDisplayedListSelect = isolate( LabeledSelect );

  const lastDisplayedListProps$ = lists$.map( lists => ({
    name: 'last-displayed-list',
    labelText: 'Work ends',
    select: R.last
  }) );

  const lastDisplayedListSelect = LastDisplayedListSelect( {
    DOM,
    props$: lastDisplayedListProps$,
    values$: lists$
  } );

  // Button to select last month period

  const SelectLastMonthButton = isolate( SelectDatesButton );

  const selectLastMonthProps$ = lists$.map( lists => ({
    label: 'Last month',
    startDate: lastMonth,
    endDate: endOfLastMonth
  }) );

  const selectLastMonthButton = SelectLastMonthButton( {
    DOM,
    props$: selectLastMonthProps$
  } );

  // Button to select current month period

  const SelectCurrentMonthButton = isolate( SelectDatesButton );

  const selectCurrentMonthProps$ = lists$.map( lists => ({
    label: 'Current month',
    startDate: currentMonth
  }) );

  const selectCurrentMonthButton = SelectCurrentMonthButton( {
    DOM,
    props$: selectCurrentMonthProps$
  } );

  // TODO - refactor these with components (trello)

  const getActionsClicks$ = DOM
    .select( '#get-actions' )
    .events( 'click' )
    .startWith( false );

  const dates$ = Observable.merge(
    selectLastMonthButton.dates$,
    selectCurrentMonthButton.dates$
  ).startWith( { startDate: currentMonth, endDate: null } );

  const actions$ = Observable.combineLatest(
    dates$,
    trelloLists$,
    trelloActions$,
    ( { startDate, endDate }, lists, actions ) => R.compose(
      filterBetweenDates( startDate, endDate ),
      parseActions( today, lists ),
    )( actions )
  );

  const displayedLists$ = Observable.combineLatest(
    trelloLists$,
    firstDisplayedListSelect.selected$,
    lastDisplayedListSelect.selected$,
    getDisplayedLists
  );

  return {
    DOM: Observable.combineLatest(
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      (
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ) => div( [
        button( { id: 'get-actions' }, 'Get actions' ),
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ] )
    ),
    Trello: getActionsClicks$,
    graph: Observable.combineLatest(
      displayedLists$,
      actions$,
      parseTrelloData
    ),
    log: trelloLists$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver( 'LydFpONf' ),
  graph: makeGraphDriver( '#chart svg' ),
  log: logDriver
};

Cycle.run( main, drivers );
