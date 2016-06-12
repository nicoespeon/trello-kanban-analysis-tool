import { div, input, label } from '@cycle/dom';
import { Observable } from 'rx';
import R from 'ramda';

function LabeledDatePicker({ DOM, props$, value$ }) {
  const newSelected$ = DOM
    .select('.datepicker')
    .events('change')
    .debounce(500)
    .map(ev => ev.target.value)
    .distinctUntilChanged();

  const selected$ = Observable.merge(
    value$,
    newSelected$
  );

  const vtree$ = Observable.combineLatest(
    props$,
    selected$,
    (props, selected) => div([
      label({ htmlFor: props.name }, props.label),
      input({
        type: 'date',
        id: props.name,
        className: R.join(' ', R.concat(['datepicker'], props.classNames)),
        value: selected,
        max: props.max,
      }),
    ])
  );

  return {
    DOM: vtree$,
    selected$,
  };
}

export default LabeledDatePicker;
