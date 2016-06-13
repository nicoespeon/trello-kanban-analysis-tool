import nv from 'nvd3';
import R from 'ramda';

function makeGraphDriver(selector) {
  return function graphSinkDriver(data$) {
    return data$.subscribe((data) => {
      nv.addGraph(() => {
        const chart = nv.models.stackedAreaChart()
          .x(R.head)
          .y(R.last)
          .clipEdge(true)
          .showControls(false)
          .useInteractiveGuideline(true)
          .color([
            '#61BD4F',
            '#0079BF',
            '#FFAB4A',
            '#FF80CE',
            '#F2D600',
            '#42548E',
            '#EB5A46',
            '#C377E0',
          ]);

        chart.xAxis
          .showMaxMin(false)
          .tickFormat((d) => d3.time.format('%d/%m/%y')(new Date(d)));

        chart.yAxis
          .tickFormat(d3.format(',.0f'));

        d3.select(selector)
          .datum(data)
          .transition()
          .duration(500)
          .call(chart);

        // Force tooltips to be removed after data refresh.
        // See: https://github.com/nvd3-community/nvd3/issues/100
        d3.selectAll(`${selector} + .nvtooltip`).remove();

        nv.utils.windowResize(chart.update);

        return chart;
      });
    });
  };
}

export { makeGraphDriver };
