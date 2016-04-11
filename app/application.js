import Cycle from '@cycle/core';
import {makeDOMDriver, div, h1, small} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/Trello';
import {makeGraphDriver} from './drivers/Graph';
import logDriver from './drivers/Log';

import LabeledSelect from './components/LabeledSelect/LabeledSelect';
import SelectDatesButton from './components/SelectDatesButton/SelectDatesButton';
import TrelloCFD from './components/TrelloCFD/TrelloCFD';
import TrelloKanbanMetrics from './components/TrelloKanbanMetrics/TrelloKanbanMetrics';

import {lastMonth, endOfLastMonth, currentMonth} from './utils/date';

function main ( { DOM, Trello } ) {
  const trelloLists$ = Trello.lists$.startWith( [] );
  const lists$ = trelloLists$.map( R.map( R.propOr( "", "name" ) ) );

  // Select to choose the first displayed list

  const FirstDisplayedListSelect = isolate( LabeledSelect );

  const firstDisplayedListProps$ = Observable.of( {
    name: 'first-displayed-list',
    labelText: 'Work begins',
    classNames: [ 'browser-default' ],
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
    classNames: [ 'browser-default' ],
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
    classNames: [ 'btn waves-effect waves-light' ],
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
    classNames: [ 'btn waves-effect waves-light' ],
    startDate: currentMonth
  }) );

  const selectCurrentMonthButton = SelectCurrentMonthButton( {
    DOM,
    props$: selectCurrentMonthProps$
  } );

  // Trello CFD

  const trelloCFDProps$ = Observable.of( {
    label: 'Get actions',
    classNames: [ 'btn waves-effect waves-light purple' ]
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

  // Trello Kanban metrics

  const trelloKanbanMetrics = TrelloKanbanMetrics( {
    actions$: Trello.actions$.startWith( [] )
  } );

  return {
    DOM: Observable.combineLatest(
      trelloCFD.DOM,
      selectLastMonthButton.DOM,
      selectCurrentMonthButton.DOM,
      firstDisplayedListSelect.DOM,
      lastDisplayedListSelect.DOM,
      trelloKanbanMetrics.DOM,
      (
        trelloCFDVTree,
        selectLastMonthButtonVTree,
        selectCurrentMonthButtonVTree,
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
          div( '.col.s6', [ firstDisplayedListVTree ] ),
          div( '.col.s6', [ lastDisplayedListVTree ] )
        ] ),
        trelloKanbanMetricsVTree
      ] )
    ),
    Trello: trelloCFD.Trello,
    Graph: trelloCFD.Graph,
    Log: trelloLists$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver( 'LydFpONf' ),
  Graph: makeGraphDriver( '#chart svg' ),
  Log: logDriver
};

Cycle.run( main, drivers );
