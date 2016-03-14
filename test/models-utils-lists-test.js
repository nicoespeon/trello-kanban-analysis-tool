import {test} from 'tape';
import R from 'ramda';

import {countCardsPerList, mapListData} from '../app/models/utils/lists';

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
