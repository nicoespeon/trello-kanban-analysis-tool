import { div, table, thead, tr, th, tbody } from '@cycle/dom';
import { Observable } from 'rx';
import R from 'ramda';

import {
  parseStartDatesOnPeriod,
  calculateLeadTime,
  calculateThroughput,
  isMissingInformation,
} from './times';
import { consolidateActions } from './actions';
import { splitToPairs } from './lists';
import { cycleTimeVTreeWithLists } from './vtree';

function TrelloKanbanMetrics(
  {
    actions$,
    dates$,
    lists$,
    complementaryActions$,
  }
) {
  const listsIds$ = lists$.map(R.pluck('id'));

  // Determine missing information

  const cards$ = Observable.combineLatest(
    dates$,
    actions$,
    listsIds$,
    parseStartDatesOnPeriod
  );

  const complementaryCardsIds$ = complementaryActions$.map(
    R.compose(
      R.uniq,
      R.map(R.path(['data', 'card', 'id'])),
      R.flatten
    )
  );

  const missingInformationCardIds$ = Observable.combineLatest(
    cards$,
    complementaryCardsIds$,
    (cards, complementaryCardsIds) => R.compose(
      R.pluck('id'),
      R.filter(isMissingInformation),
      // Only pick cards which are not already in complementary ones.
      R.differenceWith(
        R.useWith(R.equals, [R.prop('id'), R.identity]),
        R.__,
        complementaryCardsIds
      )
    )(cards)
  );

  // Calculate Lead Time from consolidated data

  const consolidatedActions$ = Observable.combineLatest(
    actions$,
    complementaryActions$,
    listsIds$,
    consolidateActions
  );

  const leadTimes$ = Observable.combineLatest(
    dates$,
    consolidatedActions$,
    listsIds$,
    calculateLeadTime
  );

  const leadTimeVTree$ = leadTimes$.map(
    leadTime => div(`Lead Time: ${leadTime} days`)
  );

  // Calculate Throughput from consolidated data

  const throughput$ = Observable.combineLatest(
    dates$,
    cards$,
    calculateThroughput
  );

  const throughputVTree$ = throughput$.map(
    throughput => div(`Throughput: ${throughput} cards / day`)
  );

  // Calculate Cycle Times from consolidated data

  const listsGroups$ = listsIds$.map(splitToPairs);

  const cycleTimes$ = Observable.combineLatest(
    dates$,
    consolidatedActions$,
    listsGroups$,
    (dates, actions, listsGroups) => R.map(
      calculateLeadTime(dates, actions)
    )(listsGroups)
  );

  const cycleTimesVTree$ = Observable.combineLatest(
    lists$,
    listsGroups$,
    cycleTimes$,
    (lists, groups, cycleTimes) =>
      table('.striped.responsive-table', [
        thead([
          tr([th('Lists'), th('Cycle Time')]),
        ]),
        tbody([
          R.compose(
            R.map(cycleTimeVTreeWithLists(lists)),
            R.zip
          )(groups, cycleTimes),
        ]),
      ])
  );

  return {
    DOM: Observable.combineLatest(
      leadTimeVTree$,
      throughputVTree$,
      cycleTimesVTree$,
      (leadTimeVTree, throughputVTree, cycleTimesVTree) =>
        div([leadTimeVTree, throughputVTree, cycleTimesVTree])
    ),
    Trello: missingInformationCardIds$.map(cardIds => ({
      type: 'fetchMissing',
      cardIds,
    })),
  };
}

export default TrelloKanbanMetrics;
