import {button} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

function SelectDatesButton ( { DOM, props$ } ) {
  const clicks$ = DOM
    .select( '.button' )
    .events( 'click' );

  const dates$ = Observable.combineLatest(
    props$,
    clicks$,
    ( props ) => R.pick( [ 'startDate', 'endDate' ], props )
  );

  const vtree$ = props$.map( props => button(
    { className: R.join( ' ', R.concat( [ 'button' ], props.classNames ) ) },
    props.label
  ) );

  return {
    DOM: vtree$,
    dates$
  };
}

export default SelectDatesButton;
