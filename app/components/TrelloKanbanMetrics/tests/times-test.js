import {test} from 'tape';

import {
  leadTimeFromDates,
  avgLeadTime
} from '../times';

test( 'leadTimeFromDates', ( assert ) => {
  const dates = [
    { list: "Backlog", date: "2016-04-01" },
    { list: "Card Preparation [2]", date: "2016-04-01" },
    { list: "Production [3]", date: "2016-04-02" },
    { list: "Tests QA [2]", date: "2016-04-05" },
    { list: "Mise en live [1]", date: "2016-04-05" },
    { list: "In Production", date: "2016-04-06" },
    { list: "Live (April 2016)", date: "2016-04-08" }
  ];
  const datesWithStartingNulls = [
    { list: "Backlog", date: null },
    { list: "Card Preparation [2]", date: null },
    { list: "Production [3]", date: "2016-04-02" },
    { list: "Tests QA [2]", date: "2016-04-05" },
    { list: "Mise en live [1]", date: "2016-04-05" },
    { list: "In Production", date: "2016-04-06" },
    { list: "Live (April 2016)", date: "2016-04-08" }
  ];
  const datesWithEndingNulls = [
    { list: "Backlog", date: "2016-04-01" },
    { list: "Card Preparation [2]", date: "2016-04-01" },
    { list: "Production [3]", date: "2016-04-02" },
    { list: "Tests QA [2]", date: "2016-04-05" },
    { list: "Mise en live [1]", date: "2016-04-05" },
    { list: "In Production", date: null },
    { list: "Live (April 2016)", date: null }
  ];

  assert.equals( leadTimeFromDates( dates ), 7, 'should return the lead time from dates' );
  assert.equals( leadTimeFromDates( datesWithStartingNulls ), 6, 'should consider the first non-null date as the start date' );
  assert.equals( leadTimeFromDates( datesWithEndingNulls ), null, 'should return null if last list has no date' );
  assert.end();
} );

test( 'avgLeadTime', ( assert ) => {
  const dataAvgInteger = [
    { leadTime: 3 },
    { leadTime: 0 },
    { leadTime: 8 },
    { leadTime: 1 },
    { leadTime: 3 }
  ];
  const dataAvgFloat = [
    { leadTime: 4 },
    { leadTime: 7 },
    { leadTime: 5 },
    { leadTime: 10 },
    { leadTime: 2 }
  ];

  assert.equals( avgLeadTime( dataAvgInteger ), 3, 'should return the average lead time from given data' );
  assert.equals( avgLeadTime( dataAvgFloat ), 6, 'should return a rounded average lead time' );
  assert.end();
} );
