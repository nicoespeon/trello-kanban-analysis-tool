import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import trelloSinkDriver from 'drivers/trello';
import logDriver from 'drivers/log';

function buttonView ( state$ ) {
  return state$
    .map( state => h( 'button', { 'disabled': (state.type === 'click') }, 'Log In' ) )
}

function main ( {DOM} ) {
  var buttonClicks$ = DOM.select( 'button' ).events( 'click' );

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    log: buttonClicks$
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: trelloSinkDriver,
  log: logDriver
};

Cycle.run( main, drivers );
