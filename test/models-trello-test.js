import {test} from 'tape';

import trelloActions from './fixtures/trello-actions';
import trelloLists from './fixtures/trello-lists';

import {
  sumNumberOfCards,
  consolidateContent,
  consolidateActions,
  parseCurrentStatus,
  parseActions,
  filterLists,
  filterActions
} from '../app/models/trello';

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
      date: "2016-01-20",
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
      date: "2016-02-08",
      content: [
        { list: "Backlog", numberOfCards: 8 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "Backlog", numberOfCards: 7 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-03-03",
      content: [
        { list: "Backlog", numberOfCards: 9 },
        { list: "Icebox Énergie", numberOfCards: 2 },
        { list: "Card Preparation", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-04-01",
      content: [
        { list: "Backlog", numberOfCards: 10 },
        { list: "Icebox Énergie", numberOfCards: 1 },
        { list: "Card Preparation", numberOfCards: 0 }
      ]
    }
  ];
  const result = consolidateActions(
    {
      date: "2016-04-01",
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
        date: "2016-03-03",
        content: [
          { list: "Backlog", numberOfCards: 1 },
          { list: "Icebox Énergie", numberOfCards: 1 }
        ]
      },
      {
        date: "2016-03-03",
        content: [
          { list: "Backlog", numberOfCards: -2 }
        ]
      },
      {
        date: "2016-03-02",
        content: [
          { list: "Backlog", numberOfCards: -2 },
          { list: "Card Preparation [2]", numberOfCards: -1 }
        ]
      },
      {
        date: "2016-03-02",
        content: [
          { list: "Card Preparation [2]", numberOfCards: 2 }
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
      date: "2016-03-02",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 9 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-06",
      content: [
        { list: "Icebox", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-07",
      content: [
        { list: "Icebox", numberOfCards: 6 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-12",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 3 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-13",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 4 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-23",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 5 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-24",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 11 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-03-27",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-04-06",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 9 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-04-10",
      content: [
        { list: "Icebox", numberOfCards: 5 },
        { list: "Icebox Énergie", numberOfCards: 6 },
        { list: "Backlog", numberOfCards: 10 },
        { list: "Card Preparation", numberOfCards: 2 },
        { list: "Production", numberOfCards: 0 }
      ]
    },
    {
      date: "2016-05-01",
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
    date: "2016-05-01",
    content: [
      { list: "Icebox", numberOfCards: 5 },
      { list: "Icebox Énergie", numberOfCards: 6 },
      { list: "Backlog", numberOfCards: 9 },
      { list: "Card Preparation", numberOfCards: 2 },
      { list: "Production", numberOfCards: 1 }
    ]
  } ];

  assert.looseEquals( parseActions( "2016-05-01", trelloLists, trelloActions ), expected, 'should correctly parse Trello actions' );
  assert.looseEquals( parseActions( "2016-05-01" )( trelloLists, trelloActions ), expected, 'should be curried' );
  assert.looseEquals( parseActions( "2016-05-01", trelloLists, [] ), expectedWithEmptyActions, 'should handle empty actions' );
  assert.end();
} );

test( 'filterLists', ( assert ) => {
  const expected = [
    {
      "id": "4eea4ffc91e31d179270127c",
      "name": "Production [3]",
      "cards": [
        { "id": "4eea501f91e31d1746098724" }
      ]
    },
    {
      "id": "4eea4ffc91e31d174600004c",
      "name": "Backlog",
      "cards": [
        { "id": "4eea501f91e31d1746000064" },
        { "id": "4eea501f92e31d1746000063" },
        { "id": "4eea501f91e31d1729800062" },
        { "id": "4eea502b91e31d1746000071" },
        { "id": "4eea502b91e31d1746000061" },
        { "id": "4eea502b91e31d1746000051" },
        { "id": "4eea502b91e31d1746000041" },
        { "id": "4eea502b91e31d1746000031" },
        { "id": "4eea502b91e31d1746000021" }
      ]
    }
  ];

  assert.deepEquals( filterLists( [ "Backlog", "Production [3]" ], trelloLists ), expected, 'should filter lists based on given displayed names' );
  assert.deepEquals( filterLists( [ "Backlog", "Production [3]" ] )( trelloLists ), expected, 'should be curried' );
  assert.end();
} );

test( 'filterActions', ( assert ) => {
  const expected = [
    {
      "id": "56eabfd5765ab54c7ab88c15",
      "data": {
        "listAfter": {
          "name": "Production [3]",
          "id": "113651f2bff3ac430c5ec80"
        },
        "listBefore": {
          "name": "Backlog",
          "id": "5519326d74abdda65bba3bd5"
        },
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "card": {
          "shortLink": "rIGBg0V9",
          "idShort": 2735,
          "name": "Envoi d'emails pour relancer les joueurs.",
          "id": "56dc003c5a0885d45c5f5ca4",
          "idList": "113651f2bff3ac430c5ec80"
        },
        "old": {
          "idList": "5519326d74abdda65bba3bd5"
        }
      },
      "type": "updateCard",
      "date": "2016-04-10T14:31:49.139Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56dc003c5a0885d45c5f5ca5",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5640ae316fa780a52826b238"
        },
        "card": {
          "shortLink": "rIGBg0V9",
          "idShort": 2735,
          "name": "Envoi d'emails pour relancer les joueurs.",
          "id": "56dc003c5a0885d45c5f5ca4"
        }
      },
      "type": "createCard",
      "date": "2016-04-06T10:02:36.133Z",
      "memberCreator": {
        "id": "50cf3712e418f91048000565",
        "avatarHash": "290d0fdd2a31f2401ce195ad585b10ff",
        "fullName": "Oswald Bernard",
        "initials": "OB",
        "username": "oswaldbernard"
      }
    },
    {
      "id": "568e35e43b644fceb47d28e3",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Current Development",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5519326d74abdda65bba3bd5"
        },
        "card": {
          "shortLink": "tl3bWDqm",
          "idShort": 2660,
          "id": "5682ad872365f16080749a38"
        }
      },
      "type": "deleteCard",
      "date": "2016-03-27T09:54:44.570Z",
      "memberCreator": {
        "id": "55dacd3db42afb6c68ef0288",
        "avatarHash": "f1746a17e476aadcb59f42ae4d32b547",
        "fullName": "Maureen Fradon",
        "initials": "MF",
        "username": "maureenfradon"
      }
    },
    {
      "id": "564b57ae2daa0ba7ed8c0b03",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Current Development",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5519326d74abdda65bba3bd5"
        },
        "card": {
          "shortLink": "XTK12Y5W",
          "idShort": 2605,
          "id": "564b579f7d14af961af2cb4f"
        }
      },
      "type": "deleteCard",
      "date": "2016-03-24T16:37:02.704Z",
      "memberCreator": {
        "id": "50cf37ec948ad4ac32000f1f",
        "avatarHash": "893ac5d6a6dfad2d0cec2c20b298a366",
        "fullName": "Fanny Garret",
        "initials": "FG",
        "username": "fannygarret"
      }
    },
    {
      "id": "56dc003c5a0885d45c5f5ca5",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5640ae316fa780a52826b238"
        },
        "card": {
          "shortLink": "rIGBg0V9",
          "idShort": 2735,
          "name": "Envoi d'emails pour relancer les joueurs.",
          "id": "56dc003c5a0885d45c5f5ca4"
        }
      },
      "type": "createCard",
      "date": "2016-03-06T10:02:36.133Z",
      "memberCreator": {
        "id": "50cf3712e418f91048000565",
        "avatarHash": "290d0fdd2a31f2401ce195ad585b10ff",
        "fullName": "Oswald Bernard",
        "initials": "OB",
        "username": "oswaldbernard"
      }
    },
    {
      "id": "56d6e47e876469ef1fe7139d",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5640ae316fa780a52826b238"
        },
        "card": {
          "shortLink": "YqE80OTs",
          "idShort": 2732,
          "name": "Refonte des ressources",
          "id": "56d6e47e876469ef1fe7139c"
        }
      },
      "type": "createCard",
      "date": "2016-03-02T13:02:54.953Z",
      "memberCreator": {
        "id": "519b3898bb87e0891c0026b0",
        "avatarHash": "302673eff8f1cd92651a1ec70fb53cd8",
        "fullName": "Fabien Bernard",
        "initials": "FB",
        "username": "fabien0102"
      }
    },
    {
      "id": "56cefc5166a0c2bab3758002",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Backlog",
          "id": "5640ae316fa780a52826b238"
        },
        "card": {
          "shortLink": "imBNidys",
          "idShort": 2730,
          "name": "Petit bug sur assemblage",
          "id": "56cefc5166a0c2bab3758001"
        }
      },
      "type": "createCard",
      "date": "2016-02-25T13:06:25.425Z",
      "memberCreator": {
        "id": "519b3898bb87e0891c0026b0",
        "avatarHash": "302673eff8f1cd92651a1ec70fb53cd8",
        "fullName": "Fabien Bernard",
        "initials": "FB",
        "username": "fabien0102"
      }
    }
  ];

  assert.deepEquals( filterActions( [ "Backlog", "Production [3]" ], trelloActions ), expected, 'should filter actions based on given displayed lists names' );
  assert.deepEquals( filterActions( [ "Backlog", "Production [3]" ] )( trelloActions ), expected, 'should be curried' );
  assert.end();
} );
