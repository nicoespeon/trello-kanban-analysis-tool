import Cycle from '@cycle/core';
import {makeDOMDriver, div, button, select, option, label} from '@cycle/dom';
import moment from 'moment';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import {parseActions, getDisplayedLists} from './models/trello';
import {parseTrelloData} from './models/graph';

import {filterBetweenDates} from './utils/utils';

function selectView ( id, labelText, selected, values ) {
  return div( [
    label( { htmlFor: id }, labelText ),
    select(
      { id: id, name: id },
      [ R.map( value => R.cond( [
        [ R.equals( selected ), R.always( option( { selected: true }, value ) ) ],
        [ R.T, R.always( option( value ) ) ]
      ] )( value ), values ) ]
    )
  ] );
}

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

  // TODO - refactor these with components (button, select, trello)
  const getActionsClicks$ = DOM
    .select( '#get-actions' )
    .events( 'click' )
    .startWith( false );

  const firstDisplayedListChanges$ = DOM
    .select( '#first-displayed-list' )
    .events( 'input' )
    .map( ev => ev.target.value )
    .startWith( "Backlog" );

  const lastDisplayedListChanges$ = DOM
    .select( '#last-displayed-list' )
    .events( 'input' )
    .map( ev => ev.target.value )
    .startWith( false );

  const trelloLists$ = Trello.lists$.startWith( [] );
  const trelloActions$ = Trello.actions$.startWith( [] );

  const lastMonthDates$ = DOM
    .select( '#last-month' )
    .events( 'click' )
    .map( R.always( { startDate: lastMonth, endDate: endOfLastMonth } ) );

  const currentMonthDates$ = DOM
    .select( '#current-month' )
    .events( 'click' )
    .map( R.always( { startDate: currentMonth, endDate: null } ) );

  const dates$ = Observable.merge( lastMonthDates$, currentMonthDates$, )
    .startWith( { startDate: currentMonth, endDate: null } );

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
    firstDisplayedListChanges$,
    lastDisplayedListChanges$,
    getDisplayedLists
  );

  const lists$ = trelloLists$.map( R.map( R.propOr( "", "name" ) ) );

  return {
    DOM: Observable.combineLatest(
      lists$,
      displayedLists$,
      ( lists, displayedLists ) =>
        div( [
          button( { id: 'get-actions' }, 'Get actions' ),
          button( { id: 'last-month' }, 'Last month' ),
          button( { id: 'current-month' }, 'Current month' ),
          selectView(
            'first-displayed-list',
            'Work begins',
            R.head( displayedLists ),
            lists
          ),
          selectView(
            'last-displayed-list',
            'Work ends',
            R.last( displayedLists ),
            lists
          )
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
