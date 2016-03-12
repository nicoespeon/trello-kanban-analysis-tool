import {test} from 'tape';

import {countCardsPerList, parseDate, sortByDate, sumNumberOfCards, mapListData, consolidateContent, parseCreateActions, consolidateActions} from '../app/models/trello';

test( 'countCardsPerList', ( assert ) => {
  const expected = [
    { list: "Backlog", numberOfCards: 3 },
    { list: "Yolo", numberOfCards: 2 },
    { list: "Icebox Énergie", numberOfCards: 2 }
  ];
  const result = countCardsPerList( [
    { name: "Backlog" },
    { name: "Yolo" },
    { name: "Backlog" },
    { name: "Backlog" },
    { name: "Icebox Énergie" },
    { name: "Yolo" },
    { name: "Icebox Énergie" }
  ] );

  assert.looseEquals( result, expected, 'should correctly count the number of cards per list' );
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

test('consolidateContent', (assert) => {
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

  assert.looseEquals(result, expected, 'should regroup contents by list, summing numberOfCards');
  assert.end();
});

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
      id: "56d8507a25a839379cc38988",
      idMemberCreator: "51843f636ef14b8a690062dc",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Production",
          id: "5186542b5dc079967b0037be"
        },
        list: { name: "Backlog", id: "5640ae316fa780a52826b238" },
        card: {
          shortLink: "G6wWB1qI",
          idShort: 2734,
          name: "Remettre achievement like Facebook avec effet placebo",
          id: "56d8507a25a839379cc38987"
        }
      },
      type: "createCard",
      date: "2016-03-03T14:55:54.110Z",
      memberCreator: {
        id: "51843f636ef14b8a690062dc",
        avatarHash: "6a8e591c71d0006179ba98abc5684385",
        fullName: "Nicolas Carlo",
        initials: "NC",
        username: "nicolascarlo"
      }
    },
    {
      id: "56d805d893a56f5b3e238ce6",
      idMemberCreator: "51843f636ef14b8a690062dc",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Production",
          id: "5186542b5dc079967b0037be"
        },
        list: {
          name: "Icebox Énergie",
          id: "56c1fb379ea1da87671c83e5"
        },
        card: {
          shortLink: "0iCG3WLA",
          idShort: 2733,
          name: "Envoyer la mécanique d’énergie sur des populations de test",
          id: "56d805d893a56f5b3e238ce5"
        }
      },
      type: "createCard",
      date: "2016-03-03T09:37:28.552Z",
      memberCreator: {
        id: "51843f636ef14b8a690062dc",
        avatarHash: "6a8e591c71d0006179ba98abc5684385",
        fullName: "Nicolas Carlo",
        initials: "NC",
        username: "nicolascarlo"
      }
    },
    {
      id: "56d6e47e876469ef1fe7139d",
      idMemberCreator: "519b3898bb87e0891c0026b0",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Production",
          id: "5186542b5dc079967b0037be"
        },
        list: {
          name: "Backlog",
          id: "5640ae316fa780a52826b238"
        },
        card: {
          shortLink: "YqE80OTs",
          idShort: 2732,
          name: "Refonte des ressources",
          id: "56d6e47e876469ef1fe7139c"
        }
      },
      type: "createCard",
      date: "2016-03-02T13:02:54.953Z",
      memberCreator: {
        id: "519b3898bb87e0891c0026b0",
        avatarHash: "302673eff8f1cd92651a1ec70fb53cd8",
        fullName: "Fabien Bernard",
        initials: "FB",
        username: "fabien0102"
      }
    },
    {
      id: "56b85daac2f667de83258300",
      idMemberCreator: "51843f636ef14b8a690062dc",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Production",
          id: "5186542b5dc079967b0037be"
        },
        list: {
          name: "Backlog",
          id: "5640ae316fa780a52826b238"
        },
        card: {
          shortLink: "efLS75jm",
          idShort: 2707,
          name: "Publication OG implicite si explicite refusée",
          id: "56b85daac2f667de832582ff"
        }
      },
      type: "createCard",
      date: "2016-02-08T09:19:38.792Z",
      memberCreator: {
        id: "51843f636ef14b8a690062dc",
        avatarHash: "6a8e591c71d0006179ba98abc5684385",
        fullName: "Nicolas Carlo",
        initials: "NC",
        username: "nicolascarlo"
      }
    },
    {
      id: "56b32df915511584b854fe83",
      idMemberCreator: "519b3898bb87e0891c0026b0",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Production",
          id: "5186542b5dc079967b0037be"
        },
        list: {
          name: "Backlog",
          id: "5640ae316fa780a52826b238"
        },
        card: {
          shortLink: "rxJlnKWM",
          idShort: 2706,
          name: "La st-valentin, c’est fini !",
          id: "56b32df915511584b854fe82"
        }
      },
      type: "createCard",
      date: "2016-02-04T10:54:49.949Z",
      memberCreator: {
        id: "519b3898bb87e0891c0026b0",
        avatarHash: "302673eff8f1cd92651a1ec70fb53cd8",
        fullName: "Fabien Bernard",
        initials: "FB",
        username: "fabien0102"
      }
    },
    {
      id: "569f5ed742c91ebae4437ba8",
      idMemberCreator: "519b3898bb87e0891c0026b0",
      data: {
        board: {
          shortLink: "LydFpONf",
          name: "Current Development",
          id: "5186542b5dc079967b0037be"
        },
        list: {
          name: "Card Preparation [2]",
          id: "53a7751f2bff3ac430c5ec80"
        },
        card: {
          shortLink: "J6gSF8re",
          idShort: 2676,
          name: "Tracking du nombre d’action par session",
          id: "569f5ed742c91ebae4437ba7"
        }
      },
      type: "createCard",
      date: "2016-01-20T10:17:59.336Z",
      memberCreator: {
        id: "519b3898bb87e0891c0026b0",
        avatarHash: "302673eff8f1cd92651a1ec70fb53cd8",
        fullName: "Fabien Bernard",
        initials: "FB",
        username: "fabien0102"
      }
    }
  ] );

  assert.looseEquals( result, expected, 'should correctly count the number of created cards' );
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
