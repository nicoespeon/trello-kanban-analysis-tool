import {test} from 'tape';
import R from 'ramda';

import {
  countCardsPerList,
  parseDate,
  sortByDate,
  sumNumberOfCards,
  mapListData,
  consolidateContent,
  parseCreateActions,
  parseDeleteActions,
  consolidateActions
} from '../app/models/trello';

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

test( 'sumNumberOfCards', ( assert ) => {
  const result = sumNumberOfCards( [
    { numberOfCards: 1 },
    { list: 'Backlog', numberOfCards: 3 },
    { numberOfCards: 4 },
    { total: 4 },
    { numberOfCards: 0 },
    { numberOfCards: 1 }
  ] );

  assert.equals( result, 9, 'should sum all numberOfCards from collection' );
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

test( 'consolidateContent', ( assert ) => {
  const expected = [
    { list: 'Icebox Énergie', numberOfCards: 3 },
    { list: 'Backlog', numberOfCards: 8 }
  ];
  const result = consolidateContent( [
    { list: 'Icebox Énergie', numberOfCards: 1 },
    { list: 'Backlog', numberOfCards: 3 },
    { list: 'Backlog', numberOfCards: 4 },
    { list: 'Icebox Énergie', numberOfCards: 2 },
    { list: 'Backlog', numberOfCards: 1 }
  ] );

  assert.looseEquals( result, expected, 'should regroup contents by list, summing numberOfCards' );
  assert.end();
} );

test( 'parseCreateActions', ( assert ) => {
  const expected = [
    {
      date: "2016-03-03",
      content: [
        { list: "Backlog", numberOfCards: 1 },
        { list: "Icebox Énergie", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-03-02",
      content: [ { list: "Backlog", numberOfCards: 1 } ]
    },
    {
      date: "2016-02-08",
      content: [ { list: "Backlog", numberOfCards: 1 } ]
    },
    {
      date: "2016-02-04",
      content: [ { list: "Backlog", numberOfCards: 1 } ]
    },
    {
      date: "2016-01-20",
      content: [ { list: "Card Preparation [2]", numberOfCards: 1 } ]
    }
  ];
  const result = parseCreateActions( [
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-03-03T14:55:54.110Z"
    },
    {
      data: {
        list: { name: "Icebox Énergie", id: "56c1fb379ea1da87671c83e5" }
      },
      date: "2016-03-03T09:37:28.552Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-03-02T13:02:54.953Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-02-08T09:19:38.792Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-02-04T10:54:49.949Z"
    },
    {
      data: {
        list: { name: "Card Preparation [2]", id: "53a7751f2bff3ac430c5ec80" }
      },
      date: "2016-01-20T10:17:59.336Z"
    }
  ] );

  assert.looseEquals( result, expected, 'should correctly count the number of created cards' );
  assert.end();
} );

test( 'parseDeleteActions', ( assert ) => {
  const expected = [
    {
      date: "2016-03-03",
      content: [
        { list: "Backlog", numberOfCards: -1 },
        { list: "Icebox Énergie", numberOfCards: -1 }
      ]
    },
    {
      date: "2016-03-02",
      content: [ { list: "Backlog", numberOfCards: -1 } ]
    },
    {
      date: "2016-02-08",
      content: [ { list: "Backlog", numberOfCards: -1 } ]
    },
    {
      date: "2016-02-04",
      content: [ { list: "Backlog", numberOfCards: -1 } ]
    },
    {
      date: "2016-01-20",
      content: [ { list: "Card Preparation [2]", numberOfCards: -1 } ]
    }
  ];
  const result = parseDeleteActions( [
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-03-03T14:55:54.110Z"
    },
    {
      data: {
        list: { name: "Icebox Énergie", id: "56c1fb379ea1da87671c83e5" }
      },
      date: "2016-03-03T09:37:28.552Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-03-02T13:02:54.953Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-02-08T09:19:38.792Z"
    },
    {
      data: {
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" }
      },
      date: "2016-02-04T10:54:49.949Z"
    },
    {
      data: {
        list: { name: "Card Preparation [2]", id: "53a7751f2bff3ac430c5ec80" }
      },
      date: "2016-01-20T10:17:59.336Z"
    }
  ] );

  assert.looseEquals( result, expected, 'should correctly count the number of deleted cards' );
  assert.end();
} );

test( 'consolidateActions', ( assert ) => {
  const expected = [
    {
      date: "2016-01-20",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-04",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-08",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 },
        { list: "Backlog", numberOfCards: 2 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 2 },
        { list: "Backlog", numberOfCards: 4 }
      ]
    },
    {
      date: "2016-03-03",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 2 },
        { list: "Backlog", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 1 }
      ]
    }
  ];
  const result = consolidateActions( [
    {
      date: "2016-02-08",
      content: [ { list: "Backlog", numberOfCards: 1 } ]
    },
    {
      date: "2016-03-03",
      content: [
        { list: "Backlog", numberOfCards: 1 },
        { list: "Icebox Énergie", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Backlog", numberOfCards: 2 },
        { list: "Card Preparation [2]", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-01-20",
      content: [
        { list: "Card Preparation [2]", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-04",
      content: [ { list: "Backlog", numberOfCards: 1 } ]
    }
  ] );

  assert.looseEquals( result, expected, 'should correctly consolidate the number of created cards' );
  assert.end();
} );
