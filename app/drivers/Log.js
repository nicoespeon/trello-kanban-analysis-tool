function logDriver ( msg$ ) {
  return msg$.subscribe( msg => console.log( msg ) )
}

export default logDriver;
