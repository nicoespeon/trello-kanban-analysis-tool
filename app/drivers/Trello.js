import R from 'ramda';
import {Observable} from 'rx';

const trelloSinkDriver = R.curry( ( boardId, input$ ) => {
  return {
    actions$: Observable.create( ( observer ) => {
      input$.subscribe( () => {
        Trello.get(
          '/boards/' + boardId + '/actions',
          {
            filter: 'createCard,deleteCard,updateCard',
            fields: 'data,date,type',
            limit: 1000
          },
          observer.onNext.bind( observer ),
          ( err ) => {
            console.log( 'Error when trying to retrieve board actions', err );
          }
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
          ( err ) => {
            console.log( 'Error when trying to retrieve board lists', err );
          }
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
