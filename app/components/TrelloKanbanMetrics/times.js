import R from 'ramda';

// avgLeadTime :: [{leadTime: Integer}] -> Integer
const avgLeadTime = R.compose(
  Math.round.bind( Math ),
  R.mean(),
  R.pluck( 'leadTime' )
);

export default {
  avgLeadTime
};
