import Cycle from '@cycle/core';
import {makeDOMDriver, div, button, select, option, label} from '@cycle/dom';
import moment from 'moment';
import {Observable} from 'rx';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import {parseActions} from './models/trello';
import {parseTrelloData} from './models/graph';

function selectView ( id, labelText, match, lists ) {
  return div( [
    label( { htmlFor: id }, labelText ),
    select(
      { id: id, name: id },
      [ R.map( name => R.cond( [
        [ R.equals( match ), R.always( option( { selected: true }, name ) ) ],
        [ R.T, R.always( option( name ) ) ]
      ] )( name ), lists ) ]
    )
  ] );
}

function main ( { DOM, Trello } ) {
  // TODO - refactor these with components (button, select, trello)
  const buttonClicks$ = DOM
    .select( 'button' )
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
    // TODO - take last column value by default
    .startWith( "Live (March 2016)" );

  const trelloLists$ = Trello.lists$.startWith( [] );

  const displayedLists$ = Observable.combineLatest(
    trelloLists$,
    firstDisplayedListChanges$,
    lastDisplayedListChanges$,
    // TODO - implement this
    () => [ "Backlog", "Card Preparation", "Production", "Tests QA", "Mise en live", "In Production", "Live (March 2016)" ]
  );

  const trelloActions$ = Observable.combineLatest(
    trelloLists$,
    Trello.actions$.startWith( [] ),
    parseActions( moment().format( 'YYYY-MM-DD' ) )
  );
  
  const trelloData$ = Observable.combineLatest(
    displayedLists$,
    trelloActions$,
    parseTrelloData
  );

  const lists$ = trelloLists$.map( R.map( R.propOr( "", "name" ) ) );

  return {
    DOM: Observable.combineLatest(
      lists$,
      firstDisplayedListChanges$,
      lastDisplayedListChanges$,
      ( lists, first, last ) =>
        div( [
          button( 'Get actions' ),
          selectView( 'first-displayed-list', 'Work begins', first, lists ),
          selectView( 'last-displayed-list', 'Work ends', last, lists )
        ] )
    ),
    Trello: buttonClicks$,
    graph: trelloData$,
    log: lists$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  graph: makeGraphDriver( '#chart svg' ),
  log: logDriver
};

Cycle.run( main, drivers );
