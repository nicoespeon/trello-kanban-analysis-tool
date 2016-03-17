import nv from 'nvd3';
import R from 'ramda';

function renderGraph ( data$ ) {
  return data$.subscribe( (data) => {
    nv.addGraph( () => {
      const chart = nv.models.stackedAreaChart()
        .x( R.head )
        .y( R.last )
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
