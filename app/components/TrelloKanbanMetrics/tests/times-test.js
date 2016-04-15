import {test} from 'tape';

import trelloActions from './fixtures/trello-actions';

import {
  parseStartDates,
  leadTimeFromDates,
  parseLeadTime,
  avgLeadTime,
  isMissingInformation
} from '../times';

test( 'parseStartDates', ( assert ) => {
  const expected = [
    {
      id: "5661abfe6c2f11e4db652169",
      startDates: [
        { list: "Production", date: "2016-04-10" },
        { list: "Tests QA", date: "2016-05-06" },
        { list: "Mise en live", date: null }
      ]
    },
    {
      id: "564077e6e6dfdc9c01244836",
      startDates: [
        { list: "Production", date: "2016-04-06" },
        { list: "Tests QA", date: "2016-04-06" },
        { list: "Mise en live", date: "2016-04-12" }
      ]
    },
    {
      id: "570768ca19fde6c4a98714b5",
      startDates: [
        { list: "Production", date: null },
        { list: "Tests QA", date: null },
        { list: "Mise en live", date: null }
      ]
    },
    {
      id: "56fb8a5af196e52193de6179",
      startDates: [
        { list: "Production", date: null },
        { list: "Tests QA", date: "2016-04-07" },
        { list: "Mise en live", date: "2016-04-07" }
      ]
    },
    {
      id: "56f3e734a5ab9295bcdb29d6",
      startDates: [
        { list: "Production", date: "2016-04-07" },
        { list: "Tests QA", date: null },
        { list: "Mise en live", date: null }
      ]
    },
    {
      id: "56f2a2265985b75e2c6e59c4",
      startDates: [
        { list: "Production", date: "2016-01-23" },
        { list: "Tests QA", date: "2016-02-07" },
        { list: "Mise en live", date: "2016-02-12" }
      ]
    },
    {
      id: "56dc003c5a0885d45c5f5ca4",
      startDates: [
        { list: "Production", date: null },
        { list: "Tests QA", date: "2016-02-08" },
        { list: "Mise en live", date: null }
      ]
    }
  ];
  const lists = [
    "Production",
    "Tests QA",
    "Mise en live"
  ];

  assert.deepEquals( parseStartDates( trelloActions, lists ), expected, 'should parse actions with given lists to determine start dates' );
  assert.end();
} );

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

test( 'parseLeadTime', ( assert ) => {
  const expected = [
    { id: "18276354", leadTime: 7 },
    { id: "13876354", leadTime: 25 },
    { id: "32876354", leadTime: 30 },
    { id: "13879024", leadTime: null },
    { id: "28776354", leadTime: 16 },
    { id: "34376354", leadTime: null }
  ];
  const data = [
    {
      id: "18276354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-01" },
        { list: "Production [3]", date: "2016-04-02" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-05" },
        { list: "In Production", date: "2016-04-06" },
        { list: "Live (April 2016)", date: "2016-04-08" }
      ]
    },
    {
      id: "13876354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-04" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: "2016-04-26" },
        { list: "Live (April 2016)", date: "2016-04-26" }
      ]
    },
    {
      id: "32876354",
      startDates: [
        { list: "Backlog", date: null },
        { list: "Card Preparation [2]", date: null },
        { list: "Production [3]", date: "2016-04-13" },
        { list: "Tests QA [2]", date: "2016-05-05" },
        { list: "Mise en live [1]", date: "2016-05-10" },
        { list: "In Production", date: "2016-05-11" },
        { list: "Live (April 2016)", date: "2016-05-13" }
      ]
    },
    {
      id: "13879024",
      startDates: [
        { list: "Backlog", date: null },
        { list: "Card Preparation [2]", date: null },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: null },
        { list: "Live (April 2016)", date: null }
      ]
    },
    {
      id: "28776354",
      startDates: [
        { list: "Backlog", date: "2016-04-09" },
        { list: "Card Preparation [2]", date: "2016-04-10" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-07" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: "2016-04-14" },
        { list: "Live (April 2016)", date: "2016-04-25" }
      ]
    },
    {
      id: "34376354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-02" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: null },
        { list: "In Production", date: null },
        { list: "Live (April 2016)", date: null }
      ]
    }
  ];

  const expectedWithoutStartDates = [
    { id: "18276354", leadTime: null },
    { id: "13876354", leadTime: null },
    { id: "32876354", leadTime: null }
  ];
  const dataWithoutStartDates = [
    { id: "18276354", startDates: [] },
    { id: "13876354", startDates: [] },
    { id: "32876354", startDates: [] }
  ];

  assert.deepEquals( parseLeadTime( data ), expected, 'should parse lead time from given data' );
  assert.deepEquals( parseLeadTime( dataWithoutStartDates ), expectedWithoutStartDates, 'should handled data without start dates' );
  assert.end();
} );

test( 'avgLeadTime', ( assert ) => {
  const dataAvgInteger = [
    { leadTime: 3 },
    { leadTime: 0 },
    { leadTime: 8 },
    { leadTime: null },
    { leadTime: 1 },
    { leadTime: 3 }
  ];
  const dataAvgFloat = [
    { leadTime: 4 },
    { leadTime: 7 },
    { leadTime: null },
    { leadTime: 5 },
    { leadTime: 10 },
    { leadTime: null },
    { leadTime: 2 }
  ];

  assert.equals( avgLeadTime( dataAvgInteger ), 3, 'should return the average lead time from given data' );
  assert.equals( avgLeadTime( dataAvgFloat ), 6, 'should return a rounded average lead time' );
  assert.end();
} );

test( 'isMissingInformation', ( assert ) => {
  const card = {
    id: "29876467890",
    startDates: [
      { list: "Production", date: "2016-03-03" },
      { list: "Tests QA", date: "2016-05-06" },
      { list: "Mise en live", date: "2016-05-10" }
    ]
  };
  const cardWithoutStart = {
    id: "29876467890",
    startDates: [
      { list: "Production", date: null },
      { list: "Tests QA", date: "2016-05-06" },
      { list: "Mise en live", date: "2016-05-10" }
    ]
  };
  const cardWithoutEnd = {
    id: "29876467890",
    startDates: [
      { list: "Production", date: "2016-03-03" },
      { list: "Tests QA", date: "2016-05-06" },
      { list: "Mise en live", date: null }
    ]
  };
  const cardWithoutStartNorEnd = {
    id: "29876467890",
    startDates: [
      { list: "Production", date: "2016-03-03" },
      { list: "Tests QA", date: "2016-05-06" },
      { list: "Mise en live", date: null }
    ]
  };
  const cardWithoutDates = {
    id: "29876467890",
    startDates: []
  };

  assert.equals( isMissingInformation( card ), false, 'should return false if given card is complete' );
  assert.equals( isMissingInformation( cardWithoutStart ), true, 'should return true if given card has no information on first start dates' );
  assert.equals( isMissingInformation( cardWithoutEnd ), false, 'should return false if card has not completed its cycle' );
  assert.equals( isMissingInformation( cardWithoutStartNorEnd ), false, 'should return false if given card has no information on first start dates but has not completed its cycle' );
  assert.equals( isMissingInformation( cardWithoutDates ), false, 'should return false if given card has no dates' );
  assert.end();
} );
