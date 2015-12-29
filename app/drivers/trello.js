const boardId = 'LydFpONf';

function trelloSinkDriver ( input$ ) {
  return Rx.Observable.create( ( observer ) => {
    input$.subscribe( () => {
      Trello.get(
        '/boards/' + boardId + '/actions',
        { filter: 'createCard' },
        observer.onNext.bind( observer ),
        ( err ) => {
          console.log( 'Error when trying to retrieve board actions', err );
        }
      );
    } );
  } );
}

function makeTrelloDriver () {
  Trello.authorize( {
    type: 'popup',
    name: 'Trello Kanban',
    scope: { read: true },
    persist: true,
    expiration: 'never',
    success: () => console.log( 'Connected to Trello.' ),
    error: () => console.log( 'Error on Trello connexion.' )
  } );

  return trelloSinkDriver;
}

export {makeTrelloDriver};
