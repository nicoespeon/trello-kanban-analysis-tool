import { div, select, option, label } from '@cycle/dom';
import { Observable } from 'rx';
import R from 'ramda';

function LabeledSelect({ DOM, props$, values$ }) {
  const newSelected$ = DOM
    .select('.select')
    .events('input')
    .map(ev => ev.target.value)
    .startWith(null);

  const selected$ = Observable.combineLatest(
    props$,
    values$,
    newSelected$,
    (props, values, newSelected) => R.cond([
      [R.contains(newSelected), R.always(newSelected)],
      [R.T, props.select],
    ])(values)
  );

  const propsDefaults = { render: R.identity };

  const vtree$ = Observable.combineLatest(
    props$.map(R.merge(propsDefaults)),
    selected$,
    values$,
    (props, selected, values) => div([
      label({ htmlFor: props.name }, props.label),
      select(
        {
          className: R.join(' ', R.concat(['select'], props.classNames)),
          name: props.name,
        },
        [R.map(value => R.cond([
          [
            R.equals(selected),
            R.always(option({ value, selected: true }, props.render(value))),
          ],
          [R.T, R.always(option({ value }, props.render(value)))],
        ])(value), values)]
      ),
    ])
  );

  return {
    DOM: vtree$,
    selected$,
  };
}

export default LabeledSelect;
