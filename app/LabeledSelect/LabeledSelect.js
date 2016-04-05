import {div, select, option, label} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

function LabeledSelect ( { DOM, props$, values$ } ) {
  const newSelected$ = DOM
    .select( '.select' )
    .events( 'input' )
    .map( ev => ev.target.value )
    .startWith( null );
  
  const selected$ = Observable.combineLatest(
    props$,
    values$,
    newSelected$,
    ( props, values, newSelected ) => R.defaultTo( 
      props.select( values ), 
      newSelected 
    )
  );

  const vtree$ = Observable.combineLatest(
    props$,
    selected$,
    values$,
    ( props, selected, values ) => div( [
      label( { htmlFor: props.name }, props.labelText ),
      select(
        '.select',
        { name: props.name },
        [ R.map( value => R.cond( [
          [ R.equals( selected ), R.always( option( { selected: true }, value ) ) ],
          [ R.T, R.always( option( value ) ) ]
        ] )( value ), values ) ]
      )
    ] )
  );

  return {
    DOM: vtree$,
    selected$
  };
}

export default LabeledSelect;
