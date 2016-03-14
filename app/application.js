import Cycle from '@cycle/core';
import {makeDOMDriver, button} from '@cycle/dom';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import logDriver from './drivers/log';

import {parseActions} from './models/trello';

function buttonView ( state$ ) {
  return state$.map( () => button( 'Get actions' ) )
}

function main ( {DOM, Trello} ) {
  const buttonClicks$ = DOM.select( 'button' ).events( 'click' );

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    log: Trello.map( parseActions )
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  log: logDriver
};

Cycle.run( main, drivers );
