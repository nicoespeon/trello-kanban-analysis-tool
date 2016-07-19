import Cycle from '@cycle/core';
import { makeDOMDriver, div, button, h1, small } from '@cycle/dom';
import storageDriver from '@cycle/storage';
import { Observable } from 'rx';
import R from 'ramda';

import { trelloSinkDriver } from './drivers/Trello';
import { makeGraphDriver } from './drivers/Graph';
import { exportToCSVDriver } from './drivers/ExportToCSV';

import Controls from './components/Controls/Controls';
import TrelloCFD from './components/TrelloCFD/TrelloCFD';
import Metrics from './components/Metrics/Metrics';

import { getDisplayedLists } from './utils/trello';
import { argsToArray } from './utils/function';

function main({ DOMControls, DOMMetrics, Trello, Storage }) {
  const publishedTrelloLists$ = Trello.lists$.publish();
  const publishedTrelloActions$ = Trello.actions$.publish();
  const publishedTrelloCardsActions$$ = Trello.cardsActions$$.publish();

  const trelloLists$ = publishedTrelloLists$.startWith([]);
  const trelloActions$ = publishedTrelloActions$.startWith([]);

  // Controls that configure the analysis.

  const controls = Controls({
    DOM: DOMControls,
    boards$: Trello.boards$,
    lists$: trelloLists$,
    Storage,
  });

  // Determine when we need to fetch board data from controls.

  const fetchBoard$ = Observable.combineLatest(
    controls.selectedBoard$,
    controls.refreshClicks$,
    (boardId) => ({ type: 'fetch', boardId })
  );

  // Compute displayed lists from controls.

  const trelloDisplayedLists$ = Observable.combineLatest(
    trelloLists$,
    controls.selectedFirstList$,
    controls.selectedLastList$,
    getDisplayedLists
  );

  // Trello CFD

  const trelloCFD = TrelloCFD({
    actions$: trelloActions$,
    lists$: trelloLists$,
    displayedLists$: trelloDisplayedLists$,
    dates$: controls.selectedDates$,
    previewTomorrow$: controls.previewTomorrow$,
  });

  // Metrics

  const metrics = Metrics({
    actions$: trelloActions$,
    dates$: controls.selectedDates$,
    lists$: trelloDisplayedLists$,
    complementaryActions$: publishedTrelloCardsActions$$
      .switch()
      .startWith([])
      .scan(R.concat),
  });

  // Download button clicks

  const downloadClicks$ = DOMMetrics.select('.download-btn').events('click');

  // Connect
  publishedTrelloLists$.connect();
  publishedTrelloActions$.connect();
  publishedTrelloCardsActions$$.connect();

  return {
    DOMControls: controls.DOM.map(
      (controlsVTree) =>
        div([
          h1('.title.center-align.trello-blue.white-text', [
            'TKAT ',
            small('.trello-blue-100-text', '(Trello Kanban Analysis Tool)'),
          ]),
          controlsVTree,
        ])
    ),
    DOMMetrics: metrics.DOM.map(
      (metricsVTree) =>
        div('.container', [
          div('.center-align', [
            button(
              '.download-btn.btn.waves-effect.waves-light.trello-blue',
              'Download .csv'
            ),
          ]),
          div('.m-top.m-bottom', [metricsVTree]),
        ])
    ),
    Trello: Observable.merge(fetchBoard$, metrics.Trello),
    Graph: trelloCFD.Graph,
    ExportToCSV: downloadClicks$.withLatestFrom(
      trelloCFD.CSV,
      R.compose(R.last, argsToArray)
    ),
    Storage: controls.Storage,
  };
}

const drivers = {
  DOMControls: makeDOMDriver('#controls'),
  DOMMetrics: makeDOMDriver('#metrics'),
  Trello: trelloSinkDriver,
  Graph: makeGraphDriver('#chart svg'),
  Storage: storageDriver,
  ExportToCSV: exportToCSVDriver,
};

Trello.authorize({
  type: 'popup',
  name: 'Trello Kanban Analysis Tool',
  scope: { read: true },
  persist: true,
  expiration: 'never',
  success: () => {
    Cycle.run(main, drivers);
  },
  error: () => console.log("Can't connect to Trello"),
});
