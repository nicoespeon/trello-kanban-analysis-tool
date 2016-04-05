import {test} from 'tape';

import trelloActions from './fixtures/trello-actions';
import trelloLists from './fixtures/trello-lists';

import {
  parseCreateActions,
  parseDeleteActions,
  getCreateActions,
  getDeleteActions,
  consolidateContent,
  consolidateActions,
  parseCurrentStatus,
  parseActions
} from '../app/TrelloCFD/actions';

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

test( 'getCreateActions', ( assert ) => {
  const expected = [
    {
      "id": "56eabfd5765ab54c7ab88c15",
      "data": {
        "list": {
          "name": "Production [3]",
          "id": "113651f2bff3ac430c5ec80"
        },
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
      "date": "2016-03-10T14:31:49.139Z",
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
      "date": "2016-03-09T10:02:36.133Z",
      "memberCreator": {
        "id": "50cf3712e418f91048000565",
        "avatarHash": "290d0fdd2a31f2401ce195ad585b10ff",
        "fullName": "Oswald Bernard",
        "initials": "OB",
        "username": "oswaldbernard"
      }
    },
    {
      "id": "56d805d893a56f5b3e238ce6",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Icebox Énergie",
          "id": "56c1fb379ea1da87671c83e5"
        },
        "card": {
          "shortLink": "0iCG3WLA",
          "idShort": 2733,
          "name": "Envoyer la mécanique d’énergie sur des populations de test",
          "id": "56d805d893a56f5b3e238ce5"
        }
      },
      "type": "createCard",
      "date": "2016-03-04T09:37:28.552Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56e556e06ac9a987e623074f",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "card": {
          "shortLink": "xYKhcAQy",
          "idShort": 2736,
          "name": "Test",
          "id": "56e556e06ac9a987e623074e"
        }
      },
      "type": "createCard",
      "date": "2016-03-01T12:02:40.821Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56eabfd5765ab54c7ab88c15",
      "data": {
        "list": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "listAfter": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "listBefore": {
          "name": "Icebox",
          "id": "5519326d74abdda65bba3bd5"
        },
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "card": {
          "shortLink": "WYBclOGp",
          "idShort": 2731,
          "name": "Tester de mettre une barre de progression sur l’invitation d’ami",
          "id": "56d56f05b9aea5e8f7e76a21",
          "idList": "53a7751f2bff3ac430c5ec80"
        },
        "old": {
          "idList": "5519326d74abdda65bba3bd5"
        }
      },
      "type": "updateCard",
      "date": "2016-02-29T14:31:49.139Z",
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
      "date": "2016-02-27T10:02:36.133Z",
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
      "date": "2016-02-26T13:02:54.953Z",
      "memberCreator": {
        "id": "519b3898bb87e0891c0026b0",
        "avatarHash": "302673eff8f1cd92651a1ec70fb53cd8",
        "fullName": "Fabien Bernard",
        "initials": "FB",
        "username": "fabien0102"
      }
    },
    {
      "id": "56d56f05b9aea5e8f7e76a22",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Icebox",
          "id": "5519326d74abdda65bba3bd5"
        },
        "card": {
          "shortLink": "WYBclOGp",
          "idShort": 2731,
          "name": "Tester de mettre une barre de progression sur l’invitation d’ami",
          "id": "56d56f05b9aea5e8f7e76a21"
        }
      },
      "type": "createCard",
      "date": "2016-02-26T10:29:25.183Z",
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
    },
    {
      "id": "56cb5a59b4823428bb4d72d5",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Icebox",
          "id": "5519326d74abdda65bba3bd5"
        },
        "card": {
          "shortLink": "j7otP572",
          "idShort": 2729,
          "name": "On peut perdre des décos / construire plus de bâtiments que prévu",
          "id": "56cb5a59b4823428bb4d72d4"
        }
      },
      "type": "createCard",
      "date": "2016-02-22T18:58:33.622Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56cb5a59b4823428bb4d72d5",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "card": {
          "shortLink": "j7otP572",
          "idShort": 2729,
          "name": "On peut perdre des décos / construire plus de bâtiments que prévu",
          "id": "56cb5a59b4823428bb4d72d4"
        }
      },
      "type": "createCard",
      "date": "2016-02-22T17:58:33.622Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    }
  ];
  const result = getCreateActions( trelloActions );

  assert.looseEquals( result, expected, 'should filter create actions only' );
  assert.end();
} );

test( 'getDeleteActions', ( assert ) => {
  const expected = [
    {
      "id": "56eabfd5765ab54c7ab88c15",
      "data": {
        "list": {
          "name": "Backlog",
          "id": "5519326d74abdda65bba3bd5"
        },
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
      "date": "2016-03-10T14:31:49.139Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
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
      "date": "2016-03-06T09:54:44.570Z",
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
      "date": "2016-03-05T16:37:02.704Z",
      "memberCreator": {
        "id": "50cf37ec948ad4ac32000f1f",
        "avatarHash": "893ac5d6a6dfad2d0cec2c20b298a366",
        "fullName": "Fanny Garret",
        "initials": "FG",
        "username": "fannygarret"
      }
    },
    {
      "id": "56e556f67400ed1b11f3d972",
      "data": {
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "list": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "card": {
          "shortLink": "2zHEauPT",
          "idShort": 2737,
          "id": "56e556eb2e87749c323967ba"
        }
      },
      "type": "deleteCard",
      "date": "2016-03-02T12:03:02.374Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56e556e368d8967f500e3269",
      "data": {
        "list": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "card": {
          "shortLink": "xYKhcAQy",
          "idShort": 2736,
          "name": "Test",
          "id": "56e556e06ac9a987e623074e",
          "closed": true
        },
        "old": {
          "closed": false
        }
      },
      "type": "updateCard",
      "date": "2016-03-02T12:02:43.287Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    },
    {
      "id": "56eabfd5765ab54c7ab88c15",
      "data": {
        "list": {
          "name": "Icebox",
          "id": "5519326d74abdda65bba3bd5"
        },
        "listAfter": {
          "name": "Card Preparation [2]",
          "id": "53a7751f2bff3ac430c5ec80"
        },
        "listBefore": {
          "name": "Icebox",
          "id": "5519326d74abdda65bba3bd5"
        },
        "board": {
          "shortLink": "LydFpONf",
          "name": "Production",
          "id": "5186542b5dc079967b0037be"
        },
        "card": {
          "shortLink": "WYBclOGp",
          "idShort": 2731,
          "name": "Tester de mettre une barre de progression sur l’invitation d’ami",
          "id": "56d56f05b9aea5e8f7e76a21",
          "idList": "53a7751f2bff3ac430c5ec80"
        },
        "old": {
          "idList": "5519326d74abdda65bba3bd5"
        }
      },
      "type": "updateCard",
      "date": "2016-02-29T14:31:49.139Z",
      "memberCreator": {
        "id": "51843f636ef14b8a690062dc",
        "avatarHash": "6a8e591c71d0006179ba98abc5684385",
        "fullName": "Nicolas Carlo",
        "initials": "NC",
        "username": "nicolascarlo"
      }
    }
  ];
  const result = getDeleteActions( trelloActions );

  assert.looseEquals( result, expected, 'should filter delete actions only' );
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
