import R from 'ramda';

import {
  parseDate,
  daysSpent,
  groupByWith,
  getCreateList,
  getCreateActions
} from '../../utils/utils';

// StartDates :: [{id: a, startDates: [{list: String, date: Date}]}]
// LeadTimes :: [{id: a, leadTime: Integer}]

// _startDatesFromActions :: [Action] -> [String] -> [{list: String, date: Date}]
const _startDatesFromActions = ( actions, lists ) => R.map(
  ( list ) => ({
    list: list,
    date: R.compose(
      R.cond( [
        [ R.isNil, R.identity ],
        [ R.T, parseDate ]
      ] ),
      R.propOr( null, 'date' ),
      R.find(
        R.compose(
          R.equals( list ),
          R.prop( 'id' ),
          getCreateList
        )
      ),
    )( actions )
  })
)( lists );

// parseStartDates :: [Action] -> [String] -> StartDates
const parseStartDates = ( actions, lists ) => R.compose(
  groupByWith(
    R.path( [ 'data', 'card', 'id' ] ),
    ( cardId, cardActions ) => ({
      id: cardId,
      startDates: _startDatesFromActions( cardActions, lists )
    })
  ),
  getCreateActions
)( actions );

// filterCardsOnPeriod :: {startDate: Date, endDate: Date} -> StartDates -> StartDates
const filterCardsOnPeriod = R.curry( ( { startDate, endDate }, cards ) =>
  R.filter(
    R.compose(
      R.both(
        R.either( () => R.isNil( endDate ), R.gte( endDate ) ),
        R.either( () => R.isNil( startDate ), R.lte( startDate ) )
      ),
      R.prop( 'date' ),
      R.last,
      R.prop( 'startDates' )
    )
  )( cards )
);

// _isDateNil :: {date: a} -> Boolean
const _isDateNil = R.compose( R.isNil, R.prop( 'date' ) );

// leadTimeFromDates :: [{list: String, date: Date}] -> Integer
const leadTimeFromDates = R.cond( [
  [
    R.either(
      R.isEmpty,
      R.compose( _isDateNil, R.last ),
    ),
    R.always( null )
  ],
  [
    R.T,
    R.compose(
      R.converge( daysSpent, [ R.head, R.last ] ),
      R.pluck( 'date' ),
      R.reject( _isDateNil )
    )
  ]
] );

// parseLeadTime :: StartDates -> LeadTimes
const parseLeadTime = R.map( card => ({
  id: card.id,
  leadTime: leadTimeFromDates( card.startDates )
}) );

// avgLeadTime :: LeadTimes -> Integer
const avgLeadTime = R.compose(
  Math.round.bind( Math ),
  R.mean,
  R.reject( R.isNil ),
  R.pluck( 'leadTime' )
);

// isMissingInformation :: StartDates -> Boolean
const isMissingInformation = R.compose(
  R.both(
    R.compose( R.not, R.isEmpty ),
    R.both(
      R.compose( _isDateNil, R.head ),
      R.compose( R.not, _isDateNil, R.last )
    )
  ),
  R.prop( 'startDates' )
);

export {
  parseStartDates,
  filterCardsOnPeriod,
  leadTimeFromDates,
  parseLeadTime,
  avgLeadTime,
  isMissingInformation
};
