import {test} from 'tape';
import R from 'ramda';

import {
  allLists,
  countCardsPerList,
  mapListData,
  parseListName,
  getDisplayedLists
} from '../lists';

test( 'allLists', ( assert ) => {
  const data = [
    {
      date: "2016-02-12",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-04",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Icebox Énergie", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-08",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 2 }
      ]
    }
  ];

  assert.looseEquals( allLists( data ), [ 'Card Preparation [2]', 'Backlog', 'Icebox Énergie' ], 'should return the list of all unique lists from Trello data' );
  assert.looseEquals( allLists( [] ), [], 'should return an empty list if data is empty' );
  assert.looseEquals( allLists( [ {}, {} ] ), [], 'should return an empty list if data is missing content' );
  assert.end();
} );

test( 'countCardsPerList', ( assert ) => {
  const data = [
    { name: "Backlog" },
    { name: "Yolo" },
    { name: "Backlog" },
    { name: "Backlog" },
    { name: "Icebox Énergie" },
    { name: "Yolo" },
    { name: "Icebox Énergie" }
  ];
  const expectedWithIdentity = [
    { list: "Backlog", numberOfCards: 3 },
    { list: "Yolo", numberOfCards: 2 },
    { list: "Icebox Énergie", numberOfCards: 2 }
  ];
  const expectedWithNegateParser = [
    { list: "Backlog", numberOfCards: -3 },
    { list: "Yolo", numberOfCards: -2 },
    { list: "Icebox Énergie", numberOfCards: -2 }
  ];

  assert.looseEquals( countCardsPerList( R.identity, data ), expectedWithIdentity, 'should correctly count the number of cards per list' );
  assert.looseEquals( countCardsPerList( R.negate, data ), expectedWithNegateParser, 'should accept a numberOfCards parser as an argument' );
  assert.looseEquals( countCardsPerList( R.negate )( data ), expectedWithNegateParser, 'should be curried' );
  assert.end();
} );

test( 'mapListData', ( assert ) => {
  const expected = [
    { name: "Backlog", id: "5640ae316fa780a52826b238" },
    { name: "Backlog", id: "5640ae316fa780a52826b238" },
    { name: "Card Preparation [2]", id: "53a7751f2bff3ac430c5ec80" }
  ];
  const result = mapListData( [
    {
      id: "56b85daac2f667de83258300",
      data: {
        board: { shortLink: "LydFpONf", id: "5186542b5dc079967b0037be" },
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" },
        card: { idShort: 2707, id: "56b85daac2f667de832582ff" }
      }
    },
    {
      id: "56b32df915511584b854fe83",
      data: {
        board: { shortLink: "LydFpONf", name: "Production" },
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      }
    },
    {
      id: "569f5ed742c91ebae4437ba8",
      data: {
        list: { name: "Card Preparation [2]", id: "53a7751f2bff3ac430c5ec80" },
        card: { shortLink: "J6gSF8re", idShort: 2676 }
      }
    }
  ] );

  assert.looseEquals( result, expected, 'should return an array of data.list' );
  assert.end();
} );

test( 'parseListName', ( assert ) => {
  assert.equals( parseListName( 'Card Preparation [4]' ), 'Card Preparation', 'should trim trailing WIP indicator' );
  assert.equals( parseListName( 'Backlog' ), 'Backlog', 'should leave a regular list name untouched' );
  assert.equals( parseListName( 'Live (March 2016)' ), 'Live (March 2016)', 'should leave live list name untouched' );
  assert.end();
} );

test( 'getDisplayedLists', ( assert ) => {
  const expected = [
    "Backlog",
    "Card Preparation",
    "Production",
    "Mise en live",
    "In Production"
  ];
  const data = [
    { "name": "Goals - Key Metrics" },
    { "name": "Templates" },
    { "name": "Icebox" },
    { "name": "Icebox Énergie" },
    { "name": "Backlog" },
    { "name": "Card Preparation [2]" },
    { "name": "Production [3]" },
    { "name": "Mise en live [1]" },
    { "name": "In Production" },
    { "name": "Live (March 2016)" }
  ];

  assert.deepEquals(
    getDisplayedLists( data, "Backlog", "In Production" ),
    expected,
    'should return names of list included within given range'
  );
  assert.deepEquals(
    getDisplayedLists( data, "Backlog", "Production [3]" ),
    [ "Backlog", "Card Preparation", "Production" ],
    'should parse given names for comparison'
  );
  assert.deepEquals(
    getDisplayedLists( data, "Production [3]", false ),
    [ "Production", "Mise en live", "In Production", "Live (March 2016)" ],
    'should take all names until the end if last is false'
  );
  assert.end();
} );
