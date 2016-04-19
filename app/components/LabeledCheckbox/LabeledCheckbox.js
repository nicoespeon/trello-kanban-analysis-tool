import {div, input, label} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

function LabeledCheckbox ( { DOM, props$ } ) {
  const checked$ = DOM
    .select( '.checkbox' )
    .events( 'change' )
    .map( ev => ev.target.checked )
    .startWith( false );

  const vtree$ = Observable.combineLatest(
    props$,
    checked$,
    ( props, checked ) => div( [
      input( {
        type: 'checkbox',
        id: props.name,
        className: R.join( ' ', R.concat( [ 'checkbox' ], props.classNames ) ),
        checked: checked
      } ),
      label( { htmlFor: props.name }, props.labelText )
    ] )
  );

  return {
    DOM: vtree$,
    checked$
  };
}

export default LabeledCheckbox;
