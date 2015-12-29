function trelloSinkDriver ( input$ ) {
  input$.subscribe( () => {
    Trello.authorize( {
      type: 'popup',
      name: 'Trello Kanban',
      success: () => {}
    } );
  } );
}

export default trelloSinkDriver;
