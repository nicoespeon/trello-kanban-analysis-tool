import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';
import {makeTrelloDriver} from 'drivers/trello';
import logDriver from 'drivers/log';

function buttonView ( state$ ) {
  return state$.map( () => h( 'button', 'Get actions' ) )
}

// TODO: export and unit test these part
function parseTrelloActions ( actions ) {
  return actions
    .map( action => action.data.list.name )
    .reduce( ( memo, list ) => {
      const knownList = R.find( R.propEq( 'name', list ) )( memo );
      ( knownList )
        ? knownList.count++
        : memo.push( { name: list, count: 1 } );

      return memo;
    }, [] );
}

function main ( {DOM, Trello} ) {
  const buttonClicks$ = DOM.select( 'button' ).events( 'click' );

  return {
    DOM: buttonView( buttonClicks$.startWith( false ) ),
    Trello: buttonClicks$,
    log: Trello.map( parseTrelloActions )
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' ),
  Trello: makeTrelloDriver(),
  log: logDriver
};

Cycle.run( main, drivers );
