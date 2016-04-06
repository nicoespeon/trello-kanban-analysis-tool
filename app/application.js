import Cycle from '@cycle/core';
import {makeDOMDriver, div, h1, small} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import LabeledSelect from './components/LabeledSelect/LabeledSelect';
import SelectDatesButton from './components/SelectDatesButton/SelectDatesButton';
import TrelloCFD from './components/TrelloCFD/TrelloCFD';

import {lastMonth, endOfLastMonth, currentMonth} from './utils/date';

function main ( { DOM, Trello } ) {
  const trelloLists$ = Trello.lists$.startWith( [] );
  const lists$ = trelloLists$.map( R.map( R.propOr( "", "name" ) ) );

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

  // Trello

  const trelloCFDProps$ = Observable.of( {
    label: 'Get actions'
  } );

  const trelloCFDDates$ = Observable.merge(
    selectLastMonthButton.dates$,
    selectCurrentMonthButton.dates$
  ).startWith( { startDate: currentMonth, endDate: null } );

  const trelloCFD = TrelloCFD( {
    DOM,
    actions$: Trello.actions$.startWith( [] ),
    lists$: trelloLists$,
    firstListDisplayed$: firstDisplayedListSelect.selected$,
    lastListDisplayed$: lastDisplayedListSelect.selected$,
    dates$: trelloCFDDates$,
    props$: trelloCFDProps$
  } );

  return {
    DOM: Observable.combineLatest(
      trelloCFD.DOM,
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      (
        trelloCFDVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ) => div( [
        h1( '.title', [
          'Trello Kanban ',
          small( 'A simple side-project' )
        ] ),
        trelloCFDVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
        firstDisplayedListVTree,
        lastDisplayedListVTree
      ] )
    ),
    Trello: trelloCFD.Trello,
    graph: trelloCFD.graph,
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
