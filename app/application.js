import Cycle from '@cycle/core';
import {makeDOMDriver, button} from '@cycle/dom';
import R from 'ramda';

import {makeTrelloDriver} from './drivers/trello';
import {makeGraphDriver} from './drivers/graph';
import logDriver from './drivers/log';

import {parseActions} from './models/trello';
import {parseTrelloData} from './models/graph';

function buttonView ( state$ ) {
  return state$.map( () => button( 'Get actions' ) )
}

function main ( { DOM, Trello } ) {
  const buttonClicks$ = DOM.select( 'button' ).events( 'click' );

  // TODO - dynamically get this
  const currentStatus = [
    {
      "list": "Live (March 2016)",
      "numberOfCards": 7
    },
    {
      "list": "In Production",
      "numberOfCards": 0
    },
    {
      "list": "Mise en live [1]",
      "numberOfCards": 1
    },
    {
      "list": "Tests QA [2]",
      "numberOfCards": 0
    },
    {
      "list": "Production [3]",
      "numberOfCards": 3
    },
    {
      "list": "Card Preparation [2]",
      "numberOfCards": 2
    },
    {
      "list": "Backlog",
      "numberOfCards": 9
    },
    {
      "list": "Icebox Énergie",
      "numberOfCards": 6
    }
  ];

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    graph: Trello.map( parseActions( currentStatus ) ).map( parseTrelloData ),
    log: Trello.map( parseActions( currentStatus ) )
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  graph: makeGraphDriver( '#chart svg' ),
  log: logDriver
};

Cycle.run( main, drivers );
