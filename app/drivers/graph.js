import nv from 'nvd3';

function renderGraph ( data$ ) {
  return data$.subscribe( () => {
    const data = [
      {
        "key": "Live",
        "values": [ [ 1025409600000, 0 ], [ 1028088000000, 0 ], [ 1030766400000, 2 ], [ 1033358400000, 2 ], [ 1036040400000, 3 ] ]
      },
      {
        "key": "Production",
        "values": [ [ 1025409600000, 0 ], [ 1028088000000, 1 ], [ 1030766400000, 2 ], [ 1033358400000, 2 ], [ 1036040400000, 2 ] ]
      },
      {
        "key": "Backlog",
        "values": [ [ 1025409600000, 4 ], [ 1028088000000, 5 ], [ 1030766400000, Math.random() * 10 ], [ 1033358400000, 2 ], [ 1036040400000, 4 ] ]
      }
    ];

    nv.addGraph( () => {
      const chart = nv.models.stackedAreaChart()
        .x( ( d ) => d[ 0 ] )
        .y( ( d ) => d[ 1 ] )
        .clipEdge( true )
        .useInteractiveGuideline( true );

      chart.xAxis
        .showMaxMin( false )
        .tickFormat( ( d ) => d3.time.format( '%x' )( new Date( d ) ) );

      chart.yAxis
        .tickFormat( d3.format( ',.0f' ) );

      d3.select( '#chart svg' )
        .datum( data )
        .transition().duration( 500 ).call( chart );

      nv.utils.windowResize( chart.update );

      return chart;
    } );
  } );
}

export default renderGraph;
