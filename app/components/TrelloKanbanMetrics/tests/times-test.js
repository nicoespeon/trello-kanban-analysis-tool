import {test} from 'tape';

import {
  avgLeadTime
} from '../times';

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
