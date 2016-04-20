import {test} from 'tape';

import {
  numberOfCardsAtDate,
  parseToGraph
} from '../graph';

test( 'numberOfCardsAtDate', ( assert ) => {
  const data = [
    {
      date: "2016-02-12",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 3 }
      ]
    },
    {
      date: "2016-02-04",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 },
        { list: "563b1afeb758fc0e81a3c1b6", numberOfCards: 1 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-08",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 2 }
      ]
    }
  ];

  assert.equals( numberOfCardsAtDate( '4eea4ffc91e31d179270127c', '2016-02-12', data ), 3, 'should return the correct number of card at given date' );
  assert.equals( numberOfCardsAtDate( '563b1afeb758fc0e81a3c1b6', '2016-02-12', data ), 0, 'should return 0 if there were no card of given list at given date' );
  assert.equals( numberOfCardsAtDate( '4eea4ffc91e31d179270127c', '2013-08-01', data ), 0, 'should return 0 if there were no card at given date' );
  assert.end();
} );

test( 'parseToGraph', ( assert ) => {
  const expected = [
    {
      "key": "Card Preparation",
      "values": [
        [ new Date( "2016-01-20" ).getTime(), 1 ],
        [ new Date( "2016-02-04" ).getTime(), 1 ],
        [ new Date( "2016-02-08" ).getTime(), 1 ],
        [ new Date( "2016-03-02" ).getTime(), 2 ],
        [ new Date( "2016-03-03" ).getTime(), 2 ]
      ]
    },
    {
      "key": "Backlog",
      "values": [
        [ new Date( "2016-01-20" ).getTime(), 0 ],
        [ new Date( "2016-02-04" ).getTime(), 1 ],
        [ new Date( "2016-02-08" ).getTime(), 2 ],
        [ new Date( "2016-03-02" ).getTime(), 4 ],
        [ new Date( "2016-03-03" ).getTime(), 5 ]
      ]
    }
  ];
  const displayedLists = [
    { id: "4eea4ffc91e31d179270127c", name: "Backlog" },
    { id: "4eea4ffc91e31d179270004c", name: "Card Preparation [2]" }
  ];
  const data = [
    {
      date: "2016-01-20",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-04",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 1 }
      ]
    },
    {
      date: "2016-02-08",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 1 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 2 }
      ]
    },
    {
      date: "2016-03-02",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 2 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 4 }
      ]
    },
    {
      date: "2016-03-03",
      content: [
        { list: "4eea4ffc91e31d179270004c", numberOfCards: 2 },
        { list: "4eea4ffc91e31d179270127c", numberOfCards: 5 },
        { list: "5640ae316fa780a52826b238", numberOfCards: 1 }
      ]
    }
  ];

  assert.looseEquals( parseToGraph( displayedLists, data ), expected, 'should correctly parse Trello data to be rendered' );
  assert.looseEquals( parseToGraph( displayedLists )( data ), expected, 'should be curried' );
  assert.looseEquals( parseToGraph( displayedLists, null ), [], 'should return an empty list if no data is passed' );
  assert.looseEquals( parseToGraph( displayedLists, [] ), [], 'should return an empty list if empty data is passed' );
  assert.looseEquals( parseToGraph( displayedLists, {} ), [], 'should return an empty list if data passed is an object' );
  assert.end();
} );
