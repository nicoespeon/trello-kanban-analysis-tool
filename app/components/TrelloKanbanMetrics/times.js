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
          R.propEq( 'name', list ),
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

// _propDate :: {date: a} -> a
const _propDate = R.prop( 'date' );

// _isDateNil :: {date: a} -> Boolean
const _isDateNil = R.compose( R.isNil, _propDate );

// leadTimeFromDates :: [{list: String, date: Date}] -> Integer
const leadTimeFromDates = R.cond( [
  [ R.compose( _isDateNil, R.last ), R.always( null ) ],
  [
    R.T,
    R.compose(
      R.converge(
        daysSpent,
        [ R.compose( _propDate, R.head ), R.compose( _propDate, R.last ) ]
      ),
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

export default {
  parseStartDates,
  leadTimeFromDates,
  parseLeadTime,
  avgLeadTime
};
