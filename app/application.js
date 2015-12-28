import Cycle from '@cycle/core';
import {makeDOMDriver, h} from '@cycle/dom';

function main ( {DOM} ) {
  return {
    // My cycle.js « Hello world »
    DOM: DOM.select( 'input' ).events( 'click' )
      .map( ev => ev.target.checked )
      .startWith( false )
      .map( toggled =>
        h( 'div', [
          h( 'input', { type: 'checkbox' } ), 'Toggle me',
          h( 'p', toggled ? 'ON' : 'OFF' )
        ] )
      )
  };
}

const drivers = {
  DOM: makeDOMDriver( '#app' )
};

Cycle.run( main, drivers );
