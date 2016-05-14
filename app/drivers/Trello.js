import R from 'ramda';
import {Observable} from 'rx';

const actionsFilter = 'createCard,deleteCard,updateCard:idList,updateCard:closed,copyCard,moveCardFromBoard';
const actionsFields = 'data,date,type';

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

function trelloSinkDriver ( input$ ) {
  return {
    boards$: Observable.create( ( observer ) => {
      Trello.get(
        '/members/me/boards',
        {
          filter: 'open',
          fields: 'name,shortLink'
        },
        ( data ) => {
          observer.onNext( data );
          observer.onCompleted();
        },
        observer.onError.bind( observer )
      );
    } ),

    actions$: Observable.create( ( observer ) => {
      input$.subscribe( ( boardId ) => {
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
      input$.subscribe( ( boardId ) => {
        Trello.get(
          '/boards/' + boardId + '/lists',
          {
            fields: 'name',
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
}

function makeTrelloDriver () {
  Trello.authorize( {
    type: 'popup',
    name: 'Trello Kanban Analysis Tool',
    scope: { read: true },
    persist: true,
    expiration: 'never',
    success: () => console.log( 'Connected to Trello.' ),
    error: () => console.log( 'Error on Trello connexion.' )
  } );

  return trelloSinkDriver;
}

export {makeTrelloDriver};
