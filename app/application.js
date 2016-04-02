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

import {filterAfterDate} from './utils/utils';

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
  const trelloActions$ = Trello.actions$
    .map( filterAfterDate( moment().date( 1 ).format( 'YYYY-MM-DD' ) ) )
    .startWith( [] );

  const actions$ = Observable.combineLatest(
    trelloLists$,
    trelloActions$,
    parseActions( moment().format( 'YYYY-MM-DD' ) )
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
