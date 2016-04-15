import R from 'ramda';
import {Observable} from 'rx';

const actionsFilter = 'createCard,deleteCard,updateCard:idList,updateCard:closed';
const actionsFields = 'data,date,type';

// To be implemented:
//
// - moveCardFromBoard
// - moveCardToBoard
// - moveListFromBoard
// - moveListToBoard
// - copyBoard
// - copyCard
// - unarchive?

// cardActions$ :: String -> Observable
function cardActions$ ( cardId ) {
  return Observable.create( ( observer ) => {
    Trello.get(
      '/cards/' + cardId + '/actions',
      {
        filter: actionsFilter,
        limit: 1000,
        fields: actionsFields,
        memberCreator: false
      },
      ( data ) => {
        observer.onNext( data );
        observer.onCompleted();
      },
      observer.onError.bind( observer )
    );
  } );
}

const trelloSinkDriver = R.curry( ( boardId, input$ ) => {
  return {
    actions$: Observable.create( ( observer ) => {
      input$.subscribe( () => {
        Trello.get(
          '/boards/' + boardId + '/actions',
          {
            filter: actionsFilter,
            fields: actionsFields,
            limit: 1000
          },
          observer.onNext.bind( observer ),
          observer.onError.bind( observer )
        );
      } );
    } ),

    lists$: Observable.create( ( observer ) => {
      input$.subscribe( () => {
        Trello.get(
          '/boards/' + boardId + '/lists',
          {
            cards: 'open',
            card_fields: ''
          },
          observer.onNext.bind( observer ),
          observer.onError.bind( observer )
        );
      } );
    } ),

    cardsActions$$: Observable.create( ( observer ) => {
      input$
        .filter( R.compose( R.not, R.isEmpty ) )
        .subscribe( ( cardIds ) => {
          observer.onNext(
            Observable.zip.apply(
              null,
              cardIds
                .map( cardActions$ )
                .concat( R.unapply( R.identity ) )
            )
          );
        } );
    } )
  };
} );

function makeTrelloDriver ( boardId ) {
  Trello.authorize( {
    type: 'popup',
    name: 'Trello Kanban',
    scope: { read: true },
    persist: true,
    expiration: 'never',
    success: () => console.log( 'Connected to Trello.' ),
    error: () => console.log( 'Error on Trello connexion.' )
  } );

  return trelloSinkDriver( boardId );
}

export {makeTrelloDriver};
