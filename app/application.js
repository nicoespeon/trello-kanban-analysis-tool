import Cycle from '@cycle/core';
import {makeDOMDriver, button} from '@cycle/dom';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import graphDriver from './drivers/graph';
import logDriver from './drivers/log';

import {parseActions} from './models/trello';
import {parseTrelloData} from './models/graph';

function buttonView ( state$ ) {
  return state$.map( () => button( 'Get actions' ) )
}

function main ( {DOM, Trello} ) {
  const buttonClicks$ = DOM.select( 'button' ).events( 'click' );

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    graph: Trello.map( parseActions ).map( parseTrelloData ),
    log: Trello.map( parseActions )
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  graph: graphDriver,
  log: logDriver
};

Cycle.run( main, drivers );
