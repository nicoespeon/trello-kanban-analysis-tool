import {test} from 'tape';

import trelloActions from './fixtures/trello-actions';
import trelloLists from './fixtures/trello-lists';

import {
  parseCreateActions,
  parseDeleteActions,
  consolidateContent,
  consolidateActions,
  parseCurrentStatus,
  parseActions
} from '../actions';

test( 'parseCreateActions', ( assert ) => {
  const expected = [
    {
      date: "2016-03-03",
      content: [
        { list: "Backlog", numberOfCards: -1 },
        { list: "Icebox Énergie", numberOfCards: -1 }
      ]
    },
    {
      date: "2016-02-26",
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
      date: "2016-02-26T13:02:54.953Z"
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
        { list: "Backlog", numberOfCards: 1 },
        { list: "Icebox Énergie", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-26",
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
      date: "2016-02-26T13:02:54.953Z"
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

test( 'consolidateActions', ( assert ) => {
  const expected = [
    {
      date: "2016-02-03",
      content: [
        { list: "Backlog", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 3 },
        { list: "Card Preparation", numberOfCards: 4 }
      ]
    },
    {
      date: "2016-02-04",
      content: [
        { list: "Backlog", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 3 },
        { list: "Card Preparation", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-05",
      content: [
        { list: "Backlog", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 3 },
        { list: "Card Preparation", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-06",
      content: [
        { list: "Backlog", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 3 },
        { list: "Card Preparation", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-07",
      content: [
        { list: "Backlog", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 3 },
        { list: "Card Preparation", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-08",
      content: [
        { list: "Backlog", numberOfCards: 8 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-09",
      content: [
        { list: "Backlog", numberOfCards: 7 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-10",
      content: [
        { list: "Backlog", numberOfCards: 7 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-11",
      content: [
        { list: "Backlog", numberOfCards: 9 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-12",
      content: [
        { list: "Backlog", numberOfCards: 10 },
        { list: "Icebox Énergie", numberOfCards: 1 },
        { list: "Card Preparation", numberOfCards: 0 }
      ]
    }
  ];
  const result = consolidateActions(
    {
      date: "2016-02-12",
      content: [
        { list: "Backlog", numberOfCards: 10 },
        { list: "Icebox Énergie", numberOfCards: 1 },
        { list: "Card Preparation [2]", numberOfCards: 0 }
      ]
    },
    [
      {
        date: "2016-02-08",
        content: [ { list: "Backlog", numberOfCards: 1 } ]
      },
      {
        date: "2016-02-11",
        content: [
          { list: "Backlog", numberOfCards: 1 },
          { list: "Icebox Énergie", numberOfCards: 1 }
        ]
      },
      {
        date: "2016-02-11",
        content: [
          { list: "Backlog", numberOfCards: -2 }
        ]
      },
      {
        date: "2016-02-09",
        content: [
          { list: "Backlog", numberOfCards: -2 },
          { list: "Card Preparation [2]", numberOfCards: -1 }
        ]
      },
      {
        date: "2016-02-09",
        content: [
          { list: "Card Preparation [2]", numberOfCards: 2 }
        ]
      },
      {
        date: "2016-02-03",
        content: [
          { list: "Card Preparation [2]", numberOfCards: 1 }
        ]
      },
      {
        date: "2016-02-04",
        content: [
          { list: "Icebox Énergie", numberOfCards: 1 },
          { list: "Card Preparation [2]", numberOfCards: 2 }
        ]
      },
      {
        date: "2016-02-04",
        content: [ { list: "Backlog", numberOfCards: -2 } ]
      }
    ] );

  assert.looseEquals( result, expected, 'should correctly consolidate the number of created cards' );
  assert.end();
} );

test( 'parseCurrentStatus', ( assert ) => {
  const expected = {
    date: "2016-03-18",
    content: [
      {
        "list": "Done",
        "numberOfCards": 4
      },
      {
        "list": "Doing",
        "numberOfCards": 2
      },
      {
        "list": "To Do Soon",
        "numberOfCards": 1
      }
    ]
  };
  const data = [
    {
      "id": "4eea4ffc91e31d174600004a",
      "name": "To Do Soon",
      "cards": [
        { "id": "4eea503791e31d1746000080" }
      ]
    },
    {
      "id": "4eea4ffc91e31d174600004b",
      "name": "Doing",
      "cards": [
        { "id": "4eea503d91e31d174600008f" },
        { "id": "4eea522c91e31d174600027e" }
      ]
    },
    {
      "id": "4eea4ffc91e31d174600004c",
      "name": "Done",
      "cards": [
        { "id": "4eea501f91e31d1746000062" },
        { "id": "4eea501f92e31d1746000062" },
        { "id": "4eea501f91e31d1729800062" },
        { "id": "4eea502b91e31d1746000071" }
      ]
    }
  ];

  assert.looseEquals( parseCurrentStatus( "2016-03-18", data ), expected, 'should parse given list and date into current status' );
  assert.looseEquals( parseCurrentStatus( "2016-03-18" )( data ), expected, 'should be curried' );
  assert.end();
} );

test( 'parseActions', ( assert ) => {
  const expected = [
    {
      date: "2016-02-22",
      content: [
        { list: "Icebox", numberOfCards: 4 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 8 },
        { list: "Card Preparation", numberOfCards: 1 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-23",
      content: [
        { list: "Icebox", numberOfCards: 4 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 8 },
        { list: "Card Preparation", numberOfCards: 1 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-24",
      content: [
        { list: "Icebox", numberOfCards: 4 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 8 },
        { list: "Card Preparation", numberOfCards: 1 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-25",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 8 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-26",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 9 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-27",
      content: [
        { list: "Icebox", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-28",
      content: [
        { list: "Icebox", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-02-29",
      content: [
        { list: "Icebox", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-01",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 3 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 4 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-03",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 4 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-04",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-05",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-07",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-08",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-09",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 9 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-10",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-11",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-12",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 9 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 1 }
      ]
    }
  ];
  const expectedWithEmptyActions = [ {
    date: "2016-03-12",
    content: [
      { list: "Icebox", numberOfCards: 5 },
      { list: "Icebox Énergie", numberOfCards: 6 },
      { list: "Backlog", numberOfCards: 9 },
      { list: "Card Preparation", numberOfCards: 2 },
      { list: "Production", numberOfCards: 1 }
    ]
  } ];

  assert.looseEquals( parseActions( "2016-03-12", trelloLists, trelloActions ), expected, 'should correctly parse Trello actions' );
  assert.looseEquals( parseActions( "2016-03-12" )( trelloLists, trelloActions ), expected, 'should be curried' );
  assert.looseEquals( parseActions( "2016-03-12", trelloLists, [] ), expectedWithEmptyActions, 'should handle empty actions' );
  assert.end();
} );
