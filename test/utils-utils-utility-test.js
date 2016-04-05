import {test} from 'tape';
import R from 'ramda';

import {
  countByWith,
  groupByWith
} from '../app/utils/utils.utility';

test( 'countByWith', ( assert ) => {
  const data = [ 1.0, 1.1, 1.2, 2.0, 3.0, 2.2 ];
  const fn = ( a, b ) => ({ number: a, count: b });

  const expected = [
    { number: '1', count: 3 },
    { number: '2', count: 2 },
    { number: '3', count: 1 }
  ];
  const result = countByWith( Math.floor, fn, data );
  const resultCurried1 = countByWith( Math.floor, fn );
  const resultCurried2 = countByWith( Math.floor );

  assert.looseEquals( expected, result, 'should return a collection of counted parsed objects' );
  assert.looseEquals( expected, resultCurried1( data ), 'should work if we pass last argument later' );
  assert.looseEquals( expected, resultCurried2( fn )( data ), 'should work if we pass arguments one by one' );

  assert.end();
} );

test( 'groupByWith', ( assert ) => {
  var fn = ( a, b ) => ({ grade: a, list: b });
  var data = [
    { grade: 'A', name: 'Aby' },
    { grade: 'A', name: 'Georges' },
    { grade: 'B', name: 'Pascal' },
    { grade: 'A', name: 'Freddy' },
    { grade: 'C', name: 'Nick' },
    { grade: 'C', name: 'Jane' }
  ];

  const expected = [
    {
      grade: 'A',
      list: [
        { grade: 'A', name: 'Aby' },
        { grade: 'A', name: 'Georges' },
        { grade: 'A', name: 'Freddy' }
      ]
    },
    {
      grade: 'B',
      list: [ { grade: 'B', name: 'Pascal' } ]
    },
    {
      grade: 'C',
      list: [
        { grade: 'C', name: 'Nick' },
        { grade: 'C', name: 'Jane' }
      ]
    }
  ];

  assert.looseEquals(
    groupByWith( R.prop( 'grade' ), fn, data ),
    expected,
    'should return a collection of grouped parsed objects'
  );
  assert.looseEquals(
    groupByWith( R.prop( 'grade' ), fn )( data ),
    expected,
    'should work if we pass last argument later'
  );
  assert.looseEquals(
    groupByWith( R.prop( 'grade' ) )( fn )( data ),
    expected,
    'should work if we pass arguments one by one'
  );
  assert.looseEquals(
    groupByWith( R.prop( 'grade' ), fn, {} ),
    [],
    'should return an empty array if data is an object'
  );

  assert.end();
} );
