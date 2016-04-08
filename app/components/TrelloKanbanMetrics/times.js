import R from 'ramda';

import {daysSpent} from '../../utils/date';

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

// parseLeadTime :: [{startDates: [{list: String, date: Date}]}] -> [{leadTime: Integer}]
const parseLeadTime = R.map( card => ({
  id: card.id,
  leadTime: leadTimeFromDates( card.startDates )
}) );

// avgLeadTime :: [{leadTime: Integer}] -> Integer
const avgLeadTime = R.compose(
  Math.round.bind( Math ),
  R.mean,
  R.reject( R.isNil ),
  R.pluck( 'leadTime' )
);

export default {
  leadTimeFromDates,
  parseLeadTime,
  avgLeadTime
};
