import Cycle from '@cycle/core';
import { makeDOMDriver, div, button, h1, small } from '@cycle/dom';
import storageDriver from '@cycle/storage';
import { Observable } from 'rx';
import R from 'ramda';

import { makeTrelloSinkDriver } from './drivers/Trello';
import { makeGraphDriver } from './drivers/Graph';
import { exportToCSVDriver } from './drivers/ExportToCSV';

import Controls from './components/Controls/Controls';
import CumulativeFlowDiagram from './components/CumulativeFlowDiagram/CumulativeFlowDiagram';
import Metrics from './components/Metrics/Metrics';

import { getDisplayedLists } from './utils/trello';
import { argsToArray } from './utils/function';

function renderControls(isLogged$, vtree$) {
  return Observable.combineLatest(
    isLogged$,
    vtree$.startWith(div()),
    (isLogged, vtree) =>
      div([
        h1('.title.center-align.trello-blue.white-text', [
          'TKAT ',
          small('.trello-blue-100-text', '(Trello Kanban Analysis Tool)'),
        ]),
        R.ifElse(
          R.identity,
          R.always(vtree),
          R.always(
            div('.center-align', [
              button(
                '.auth-btn.btn.waves-effect.waves-light.trello-blue',
                'Connect to Trello'
              ),
            ])
          )
        )(isLogged),
      ])
  );
}

function renderMetrics(isLogged$, vtree$) {
  return vtree$.pausable(isLogged$).map(
    (vtree) =>
      div('.container', [
        div('.center-align', [
          button(
            '.download-btn.btn.waves-effect.waves-light.trello-blue',
            'Download .csv'
          ),
        ]),
        div('.m-top.m-bottom', [vtree]),
      ])
  );
}

function main({ DOMControls, DOMMetrics, Trello, Storage }) {
  const trelloLists$ = Trello.get('lists').startWith([]);
  const trelloActions$ = Trello.get('actions').startWith([]);

  // Authorization (= Trello login).

  const isLogged$ = Trello.get('authorize').map(true).startWith(false);
  const authorize$ = DOMControls.select('.auth-btn')
    .events('click')
    .map(R.always({ type: 'authorize' }))
    .startWith({ type: 'authorize', interactive: false });

  // Get Trello boards when logged in.

  const getBoards$ = isLogged$.filter(R.identity)
    .map(R.always({ type: 'getBoards' }));

  // Controls that configure the analysis.

  const controls = Controls({
    DOM: DOMControls,
    boards$: Trello.get('boards'),
    lists$: trelloLists$,
    Storage,
  });

  // Determine when we need to fetch board data from controls.

  const fetch$ = Observable.combineLatest(
    controls.selectedBoard$,
    controls.refreshClicks$.startWith(false).pausable(isLogged$),
    (boardId) => ({ type: 'fetch', boardId })
  );

  // Compute displayed lists from controls.

  const trelloDisplayedLists$ = Observable.combineLatest(
    trelloLists$,
    controls.selectedFirstList$,
    controls.selectedLastList$,
    getDisplayedLists
  );

  // Cumulative Flow Diagram

  const cumulativeFlowDiagram = CumulativeFlowDiagram({
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
    complementaryActions$: Trello.get('cardsActions')
      .switch()
      .startWith([])
      .scan(R.concat),
  });

  // Download button clicks

  const downloadClicks$ = DOMMetrics.select('.download-btn').events('click');

  return {
    DOMControls: renderControls(isLogged$, controls.DOM),
    DOMMetrics: renderMetrics(isLogged$, metrics.DOM),
    Trello: Observable.merge(
      authorize$,
      getBoards$,
      fetch$,
      metrics.Trello
    ),
    Graph: cumulativeFlowDiagram.Graph,
    ExportToCSV: downloadClicks$.withLatestFrom(
      cumulativeFlowDiagram.CSV,
      R.compose(R.last, argsToArray)
    ),
    Storage: controls.Storage,
  };
}

const drivers = {
  DOMControls: makeDOMDriver('#controls'),
  DOMMetrics: makeDOMDriver('#metrics'),
  Trello: makeTrelloSinkDriver('Trello Kanban Analysis Tool'),
  Graph: makeGraphDriver('#chart svg'),
  Storage: storageDriver,
  ExportToCSV: exportToCSVDriver,
};

Cycle.run(main, drivers);
