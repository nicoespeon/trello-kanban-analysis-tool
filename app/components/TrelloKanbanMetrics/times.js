import R from 'ramda';

import {
  parseDate,
  daysSpent,
  groupByWith,
  getCreateList,
  getCreateActions,
  round,
} from '../../utils/utils';

// StartDates :: [{id: a, startDates: [{list: String, date: Date}]}]
// LeadTimes :: [{id: a, leadTime: Integer}]

// filterCardsOnPeriod :: {startDate: Date, endDate: Date} -> StartDates -> StartDates
const filterCardsOnPeriod = R.curry(({ startDate, endDate }, cards) =>
  R.filter(
    R.compose(
      R.both(
        R.either(() => R.isNil(endDate), R.gte(endDate)),
        R.either(() => R.isNil(startDate), R.lte(startDate))
      ),
      R.propOr(null, 'date'),
      R.last,
      R.prop('startDates')
    )
  )(cards)
);

// startDatesFromActions :: [Action] -> [String] -> [{list: String, date: Date}]
const startDatesFromActions = (actions, lists) => R.map(
  (list) => ({
    list,
    date: R.compose(
      R.cond([
        [R.isNil, R.identity],
        [R.T, parseDate],
      ]),
      R.propOr(null, 'date'),
      R.find(
        R.compose(
          R.equals(list),
          R.prop('id'),
          getCreateList
        )
      )
    )(actions),
  })
)(lists);

// parseStartDates :: [Action] -> [String] -> StartDates
const parseStartDates = R.curry((actions, lists) => R.compose(
  groupByWith(
    R.path(['data', 'card', 'id']),
    (cardId, cardActions) => ({
      id: cardId,
      startDates: startDatesFromActions(cardActions, lists),
    })
  ),
  getCreateActions
)(actions));

// parseStartDatesOnPeriod :: {startDate: Date, endDate: Date} -> [Action] -> [String] -> StartDates
const parseStartDatesOnPeriod = R.curry((dates, actions, lists) => R.compose(
  filterCardsOnPeriod(dates),
  parseStartDates(actions)
)(lists));

// isDateNil :: {date: a} -> Boolean
const isDateNil = R.compose(R.isNil, R.prop('date'));

// leadTimeFromDates :: [{list: String, date: Date}] -> Integer
const leadTimeFromDates = R.cond([
  [
    R.either(
      R.isEmpty,
      R.compose(isDateNil, R.last)
    ),
    R.always(null),
  ],
  [
    R.T,
    R.compose(
      R.converge(daysSpent, [R.head, R.last]),
      R.pluck('date'),
      R.reject(isDateNil)
    ),
  ],
]);

// avgLeadTime :: LeadTimes -> Integer
const avgLeadTime = R.compose(
  Math.round.bind(Math),
  R.mean,
  R.reject(R.isNil),
  R.pluck('leadTime')
);

// parseLeadTime :: StartDates -> LeadTimes
const parseLeadTime = R.map(card => ({
  id: card.id,
  leadTime: leadTimeFromDates(card.startDates),
}));

// parseAvgLeadTime :: StartDates -> Integer
const parseAvgLeadTime = R.compose(avgLeadTime, parseLeadTime);

// calculateThroughput :: {startDate: date, endDate: date} -> StartDates -> Number
const calculateThroughput = R.compose(
  round,
  R.defaultTo(0),
  R.converge(
    R.divide,
    [
      R.compose(R.length, filterCardsOnPeriod),
      (dates) => daysSpent(dates.startDate, dates.endDate),
    ]
  )
);

// isMissingInformation :: StartDates -> Boolean
const isMissingInformation = R.compose(
  R.both(
    R.compose(R.not, R.isEmpty),
    R.both(
      R.compose(isDateNil, R.head),
      R.compose(R.not, isDateNil, R.last)
    )
  ),
  R.prop('startDates')
);

export {
  filterCardsOnPeriod,
  parseStartDates,
  parseStartDatesOnPeriod,
  leadTimeFromDates,
  avgLeadTime,
  parseLeadTime,
  parseAvgLeadTime,
  calculateThroughput,
  isMissingInformation,
};
