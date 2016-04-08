import {div} from '@cycle/dom';
import {Observable} from 'rx';
import R from 'ramda';

import {parseLeadTime, avgLeadTime} from './times';

function LabeledSelect () {
  var lists$ = Observable.of( [ "Backlog", "Card Preparation [2]", "Production [3]", "Tests QA [2]", "Mise en live [1]", "In Production", "Live (April 2016)" ] );
  
  const cards$ = Observable.of( [
    {
      id: "18276354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-01" },
        { list: "Production [3]", date: "2016-04-02" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-05" },
        { list: "In Production", date: "2016-04-06" },
        { list: "Live (April 2016)", date: "2016-04-08" }
      ]
    },
    {
      id: "13876354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-04" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: "2016-04-26" },
        { list: "Live (April 2016)", date: "2016-04-26" }
      ]
    },
    {
      id: "32876354",
      startDates: [
        { list: "Backlog", date: null },
        { list: "Card Preparation [2]", date: null },
        { list: "Production [3]", date: "2016-04-13" },
        { list: "Tests QA [2]", date: "2016-05-05" },
        { list: "Mise en live [1]", date: "2016-05-10" },
        { list: "In Production", date: "2016-05-11" },
        { list: "Live (April 2016)", date: "2016-05-13" }
      ]
    },
    {
      id: "13879024",
      startDates: [
        { list: "Backlog", date: null },
        { list: "Card Preparation [2]", date: null },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: null },
        { list: "Live (April 2016)", date: null }
      ]
    },
    {
      id: "28776354",
      startDates: [
        { list: "Backlog", date: "2016-04-09" },
        { list: "Card Preparation [2]", date: "2016-04-10" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-07" },
        { list: "Mise en live [1]", date: "2016-04-10" },
        { list: "In Production", date: "2016-04-14" },
        { list: "Live (April 2016)", date: "2016-04-25" }
      ]
    },
    {
      id: "34376354",
      startDates: [
        { list: "Backlog", date: "2016-04-01" },
        { list: "Card Preparation [2]", date: "2016-04-02" },
        { list: "Production [3]", date: "2016-04-05" },
        { list: "Tests QA [2]", date: "2016-04-05" },
        { list: "Mise en live [1]", date: null },
        { list: "In Production", date: null },
        { list: "Live (April 2016)", date: null }
      ]
    }
  ] );

  const vtree$ = cards$.map(
    R.compose(
      leadTime => div( `Lead Time: ${leadTime} days` ),
      avgLeadTime,
      parseLeadTime
    )
  );

  return {
    DOM: vtree$
  };
}

export default LabeledSelect;
