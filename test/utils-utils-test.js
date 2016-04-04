import {test} from 'tape';
import R from 'ramda';

import {
  countByWith,
  groupByWith,
  parseDate,
  sortByDate,
  sortByDateDesc,
  uniqByDateDesc,
  nextDay,
  fillMissingDates,
  filterBeforeDate,
  filterAfterDate,
  filterBetweenDates,
  parseListName
} from '../app/utils/utils';

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

test( 'parseDate', ( assert ) => {
  assert.equal( parseDate( '2016-03-03T14:55:54.110Z' ), '2016-03-03', 'should correctly parse an ISODate' );
  assert.end();
} );

test( 'sortByDate', ( assert ) => {
  const expected = [
    { date: "2015-11-20" },
    { date: "2016-01-01" },
    { date: "2016-01-08" },
    { date: "2016-04-12" },
    { date: "2016-10-01" }
  ];
  const result = sortByDate( [
    { date: "2016-01-01" },
    { date: "2016-04-12" },
    { date: "2015-11-20" },
    { date: "2016-10-01" },
    { date: "2016-01-08" }
  ] );

  assert.looseEquals( result, expected, 'should sort collection by increasing date' );
  assert.end();
} );

test( 'sortByDateDesc', ( assert ) => {
  const expected = [
    { date: "2016-10-01" },
    { date: "2016-04-12" },
    { date: "2016-01-08" },
    { date: "2016-01-01" },
    { date: "2015-11-20" }
  ];
  const result = sortByDateDesc( [
    { date: "2016-01-01" },
    { date: "2016-04-12" },
    { date: "2015-11-20" },
    { date: "2016-10-01" },
    { date: "2016-01-08" }
  ] );

  assert.looseEquals( result, expected, 'should sort collection by decreasing date' );
  assert.end();
} );

test( 'uniqByDateDesc', ( assert ) => {
  const expected = [
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: -2 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 5 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Icebox", numberOfCards: 2 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 2 }
      ]
    },
    {
      date: "2016-02-25",
      content: [
        { list: "Icebox", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 9 },
        { list: "Backlog", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-22",
      content: [
        { list: "Icebox", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 1 }
      ]
    }
  ];
  const result = uniqByDateDesc( [
    {
      date: "2016-02-22",
      content: [
        { list: "Icebox", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-25",
      content: [
        { list: "Icebox", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-25",
      content: [
        { list: "Icebox", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 9 },
        { list: "Backlog", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Icebox", numberOfCards: 2 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 2 }
      ]
    },
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: 2 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: 20 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: -2 },
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 5 }
      ]
    }
  ] );

  assert.looseEquals( result, expected, 'should return a new list with uniq dates, taking the last one' );
  assert.end();
} );

test( 'nextDay', ( assert ) => {
  assert.equals( nextDay( '2015-01-02' ), '2015-01-03', 'should return the date incremented by one day' );
  assert.equals( nextDay( '2015-01-31' ), '2015-02-01', 'should handle end of months' );
  assert.equals( nextDay( '2015-12-31' ), '2016-01-01', 'should handle end of years' );
  assert.end();
} );

test( 'fillMissingDates', ( assert ) => {
  const expected = [
    { date: "2015-01-02", label: "lorem" },
    { date: "2015-01-03", label: "ipsum" },
    { date: "2015-01-04", label: "ipsum" },
    { date: "2015-01-05", label: "ipsum" },
    { date: "2015-01-06", label: "dolor" },
    { date: "2015-01-07", label: "sit" }
  ];
  const data = [
    { date: "2015-01-03", label: "ipsum" },
    { date: "2015-01-06", label: "dolor" },
    { date: "2015-01-07", label: "sit" },
    { date: "2015-01-02", label: "lorem" }
  ];

  assert.deepEquals( fillMissingDates( data ), expected, 'should fill missing dates with duplicate data' );
  assert.end();
} );

test( 'filterBeforeDate', ( assert ) => {
  const expected = [
    { date: "2016-03-24T16:37:02.704Z" },
    { date: "2016-03-23T23:59:02.704Z" },
    { date: "2016-03-27T09:54:44.570Z" }
  ];
  const data = [
    { date: "2016-03-24T16:37:02.704Z" },
    { date: "2016-04-10T14:31:49.139Z" },
    { date: "2016-03-23T23:59:02.704Z" },
    { date: "2016-03-27T09:54:44.570Z" },
    { date: "2016-04-06T10:02:36.133Z" }
  ];

  const expectedShortened = [
    { date: "2016-03-24" },
    { date: "2016-03-23" },
    { date: "2016-03-27" }
  ];
  const dataShortened = [
    { date: "2016-03-24" },
    { date: "2016-04-10" },
    { date: "2016-03-23" },
    { date: "2016-03-27" },
    { date: "2016-04-06" }
  ];

  assert.deepEquals( filterBeforeDate( '2016-04-01T12:00:44.570Z', data ), expected, 'should filter dates that are before endDate' );
  assert.deepEquals( filterBeforeDate( '2016-04-01T12:00:44.570Z' )( data ), expected, 'should be curried' );
  assert.deepEquals( filterBeforeDate( '2016-04-01', data ), expected, 'should handle shortened endDate representation' );
  assert.deepEquals( filterBeforeDate( '2016-04-01', dataShortened ), expectedShortened, 'should handle shortened dates representation' );
  assert.deepEquals( filterBeforeDate( null, data ), data, 'should return the whole list if no endDate is provided' );
  assert.end();
} );

test( 'filterAfterDate', ( assert ) => {
  const expected = [
    { date: "2016-04-10T14:31:49.139Z" },
    { date: "2016-03-27T09:54:44.570Z" },
    { date: "2016-04-06T10:02:36.133Z" }
  ];
  const data = [
    { date: "2016-03-24T16:37:02.704Z" },
    { date: "2016-04-10T14:31:49.139Z" },
    { date: "2016-03-23T23:59:02.704Z" },
    { date: "2016-03-27T09:54:44.570Z" },
    { date: "2016-04-06T10:02:36.133Z" }
  ];

  const expectedShortened = [
    { date: "2016-04-10" },
    { date: "2016-03-27" },
    { date: "2016-04-06" }
  ];
  const dataShortened = [
    { date: "2016-03-24" },
    { date: "2016-04-10" },
    { date: "2016-03-23" },
    { date: "2016-03-27" },
    { date: "2016-04-06" }
  ];

  assert.deepEquals( filterAfterDate( '2016-03-26T12:00:44.570Z', data ), expected, 'should filter dates that are after startDate' );
  assert.deepEquals( filterAfterDate( '2016-03-26T12:00:44.570Z' )( data ), expected, 'should be curried' );
  assert.deepEquals( filterAfterDate( '2016-03-27', data ), expected, 'should handle shortened startDate representation' );
  assert.deepEquals( filterAfterDate( '2016-03-27', dataShortened ), expectedShortened, 'should handle shortened dates representation' );
  assert.deepEquals( filterAfterDate( null, data ), data, 'should return the whole list if no startDate is provided' );
  assert.end();
} );

test( 'filterBetweenDates', ( assert ) => {
  const expected = [
    { date: "2016-03-27T09:54:44.570Z" },
    { date: "2016-04-06T10:02:36.133Z" }
  ];
  const data = [
    { date: "2016-03-24T16:37:02.704Z" },
    { date: "2016-04-10T14:31:49.139Z" },
    { date: "2016-03-23T23:59:02.704Z" },
    { date: "2016-03-27T09:54:44.570Z" },
    { date: "2016-04-06T10:02:36.133Z" }
  ];

  const expectedShortened = [
    { date: "2016-03-27" },
    { date: "2016-04-06" }
  ];
  const dataShortened = [
    { date: "2016-03-24" },
    { date: "2016-04-10" },
    { date: "2016-03-23" },
    { date: "2016-03-27" },
    { date: "2016-04-06" }
  ];

  assert.deepEquals( filterBetweenDates( '2016-03-26T12:00:44.570Z', '2016-04-07T12:00:44.570Z', data ), expected, 'should filter dates that are between bound dates' );
  assert.deepEquals( filterBetweenDates( '2016-03-26T12:00:44.570Z', '2016-04-07T12:00:44.570Z' )( data ), expected, 'should be curried' );
  assert.deepEquals( filterBetweenDates( '2016-03-27', '2016-04-07', data ), expected, 'should handle shortened bound dates representation' );
  assert.deepEquals( filterBetweenDates( '2016-03-27', '2016-04-07', dataShortened ), expectedShortened, 'should handle shortened dates representation' );
  assert.deepEquals( filterBetweenDates( null, null, data ), data, 'should return the whole list if no bound dates are provided' );
  assert.end();
} );

test( 'parseListName', ( assert ) => {
  assert.equals( parseListName( 'Card Preparation [4]' ), 'Card Preparation', 'should trim trailing WIP indicator' );
  assert.equals( parseListName( 'Backlog' ), 'Backlog', 'should leave a regular list name untouched' );
  assert.equals( parseListName( 'Live (March 2016)' ), 'Live (March 2016)', 'should leave live list name untouched' );
  assert.end();
} );
