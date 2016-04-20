import {tr, td} from '@cycle/dom';
import R from 'ramda';

import {getListNameFromId} from '../../utils/trello';

function cycleTimeVTree ( cycleTime ) {
  return tr( [
    td(
      R.compose(
        R.join( ' → ' ),
        R.head
      )( cycleTime )
    ),
    td( `${R.last( cycleTime )} days` )
  ] );
}

function cycleTimeVTreeWithLists ( lists ) {
  return R.compose(
    cycleTimeVTree,
    R.over(
      R.lensIndex( 0 ),
      R.map( getListNameFromId( lists ) )
    ),
  );
}

export {cycleTimeVTreeWithLists};
