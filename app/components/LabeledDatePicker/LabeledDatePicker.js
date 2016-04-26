import {div, input, label} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

function LabeledDatePicker ( { DOM, props$ } ) {
  const changes$ = DOM
    .select( '.datepicker' )
    .events( 'change' )
    .map( ev => ev.target.value )
    .startWith( null );

  const vtree$ = Observable.combineLatest(
    props$,
    changes$,
    ( props, checked ) => div( [
      label( { htmlFor: props.name }, props.label ),
      input( {
        type: 'date',
        id: props.name,
        className: R.join( ' ', R.concat( [ 'datepicker' ], props.classNames ) )
      } )
    ] )
  );

  return {
    DOM: vtree$,
    changes$
  };
}

export default LabeledDatePicker;
